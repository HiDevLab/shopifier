from __future__ import unicode_literals

from django.db import models
from django.utils import timezone

from django.utils.translation import ugettext_lazy as _

from pycountry import countries, subdivisions

from customer.tags import TagField, TagQuerySet


class Customer(models.Model):

    STATES = (
        ('disabled', 'disabled'),
        ('decline', 'decline'),
        ('invited', 'invited'),
    )

    accepts_marketing = models.BooleanField(
        _('Customer accepts marketing'), default=False
    )
    created_at = models.DateTimeField(
        _('When the customer was created'), default=timezone.now
    )
    default_address = models.OneToOneField(
        'Address', related_name='+', null=True
    )
    email = models.EmailField(
        _('Email'), max_length=254, blank=True, unique=True
    )
    first_name = models.CharField(_('First Name'), max_length=30, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=30, blank=True)
    note = models.TextField(_('Notes'), blank=True, max_length=254)
    state = models.CharField(
        max_length=20, choices=STATES, default='disabled'
    )
    tags = TagField()
    tax_exempt = models.BooleanField(
        _('Customer is tax exempt'), default=True
    )
    updated_at = models.DateTimeField(
        _('Information was updated'), default=timezone.now
    )
    verified_email = models.BooleanField(default=True)
    objects = TagQuerySet.as_manager()

    @property
    def name(self):
        return '{} {}'.format(self.first_name, self.last_name)


class Address(models.Model):
    EXTRA_COUNTRY_CHOICES = [
        ('XK', _('Kosovo')),
    ]

    COUNTRY_CHOICES = [(c.alpha2, getattr(c, 'common_name', c.name))
                       for c in countries]
    PROVINCE_CHOICES = [(c.code, c.name) for c in subdivisions]

    customer = models.ForeignKey(Customer, related_name='addresses')
    address1 = models.CharField(_('Address'), blank=True, max_length=254)
    address2 = models.CharField(_("Address Con't"), blank=True, max_length=254)
    first_name = models.CharField(_('First Name'), max_length=30, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=30, blank=True)
    phone = models.CharField(_('Phone'), max_length=30, blank=True)
    city = models.CharField(_('City'), blank=True, null=True, max_length=54)
    company = models.CharField(_('Company'), blank=True, max_length=254)
    country_code = models.CharField(
        _('Coutry'), max_length=2, choices=COUNTRY_CHOICES, null=True
    )
    province = models.CharField(_('Region'), blank=True, max_length=254)
    province_code = models.CharField(
        _('Region'), max_length=10, choices=PROVINCE_CHOICES, blank=True
    )
    zip = models.CharField(_('Postal / Zip Code'), blank=True, max_length=20)

    @property
    def default(self):
        return self.customer.default_address_id == self.id
