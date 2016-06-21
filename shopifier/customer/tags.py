#https://github.com/funkybob/django-array-tags

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Count, QuerySet, F

class TagField(ArrayField):
    def __init__(self, **kwargs):
        self.lower = kwargs.pop('lower', True)
        kwargs.setdefault('blank', True)
        kwargs.setdefault('base_field', models.CharField(max_length=50))
        super(TagField, self).__init__(**kwargs)

    def pre_save(self, model_instance, add):
        '''
        Trim whitspace and deduplicate values.
        '''
        values = super(TagField, self).pre_save(model_instance, add)
        if values is None:
            return []
        values = {val.strip() for val in values}
        if self.lower:
            values = {val.lower() for val in values}
        return tuple(values)

    def contribute_to_class(self, cls, name, virtual_only=False):
        '''
        Add a 'get_{name}_most_like' method.
        '''
        super(TagField, self).contribute_to_class(cls, name, virtual_only)

        def get_most_like_by_FIELD(self, exclude_self=True, field=name):
            qset = self._default_manager.all()
            if exclude_self:
                qset = qset.exclude(pk=self.pk)
            return qset.most_like(field, getattr(self, field))


class Unnest(models.Func):
    function = 'unnest'
    arity = 1


class ArrayLength(models.Func):
    function = 'array_length'
    arity = 1


class Intersect(models.Func):
    template = 'array_length(ARRAY(SELECT * FROM UNNEST(%(field)s) WHERE UNNEST = ANY(%(value)s)), 1)'
    output_field = models.IntegerField()
    arity = 2

    def as_sql(self, compiler, connection, function=None, template=None):
        field_sql, field_params = compiler.compile(self.source_expressions[0])
        value_sql, value_params = compiler.compile(self.source_expressions[1])

        template = template or self.extra.get('template', self.template)
        return (
            template % {'field': field_sql, 'value': value_sql},
            field_params + value_params,
        )


class TagQuerySet(QuerySet):
    '''
    Mix into your tagged model to provide extra helpers
    '''
    def all_tag_values(self, name):
        return (
            self.order_by()
            .annotate(_v=Unnest(name))
            .values_list('_v', flat=True)
            .distinct()
        )

    def count_tag_values(self, name):
        return (
            self.order_by()
            .annotate(_v=Unnest(name))
            .values('_v')
            .annotate(count=Count('*'))
            .values_list('_v', 'count')
        )

    def most_like(self, field, tags):
        '''
        '''
        return (
            self.order_by()
            .annotate(similarity=Intersect(F(field), tags))
            .order_by('-similarity')
        )