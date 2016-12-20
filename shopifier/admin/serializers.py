from __future__ import unicode_literals

import json
from urllib import urlretrieve

from django.conf import settings as django_settings
from django.contrib.gis.geoip2 import GeoIP2
from django.core.files.base import ContentFile
from django.core.signing import Signer
from django.core.validators import URLValidator
from django.db.models import Max
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.fields import empty
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from drf_extra_fields.fields import Base64ImageField
from easy_thumbnails.files import get_thumbnailer

from shopifier.admin.models import (
    User, UserLog, Customer, Address, Product, ProductImage)


# accounts
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(max_length=128)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(min_length=6)
    password = serializers.CharField(min_length=6)


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)


class PasswordResetSerializer(serializers.Serializer):
    pk = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all())
    token = serializers.CharField(max_length=32)
    password = serializers.CharField(min_length=6)


class UserInviteSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')


class UserCheckTokenSerializer(serializers.Serializer):
    pk = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all())
    token = serializers.CharField(max_length=32)


class UserActivateSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_active=True))
    email = serializers.EmailField(
        max_length=255, required=True, allow_null=False
    )
    first_name = serializers.CharField(
        max_length=128, required=True, allow_null=False
    )
    last_name = serializers.CharField(
        max_length=128, required=True, allow_null=False
    )
    phone = serializers.CharField(
        max_length=128, required=False, allow_blank=True
    )
    password1 = serializers.CharField(
        max_length=128, required=True, allow_null=False
    )
    password2 = serializers.CharField(
        max_length=128,  required=True, allow_null=False
    )
    token = serializers.CharField(
        max_length=32, required=True, allow_null=False
    )


class UserSerializer(serializers.ModelSerializer):
    avatar_image = Base64ImageField(required=False, allow_null=True)
    avatar = serializers.SerializerMethodField()
    store_name = serializers.SerializerMethodField()
    settings = serializers.SerializerMethodField()

    PRIVATE_SETTINGS = [
        'STORE_NAME',
    ]

    class Meta:
        model = User
        exclude = ('password',)

    def get_avatar(self, obj):
        if obj.avatar_image:
            return get_thumbnailer(obj.avatar_image)['avatar'].url

    def get_settings(self, obj):
        return self.get_parameters()

    @classmethod
    def get_parameters(cls):
        out = {
            parameter: getattr(django_settings, parameter)
            for parameter in cls.PRIVATE_SETTINGS
        }
        return json.dumps(out)

    def get_store_name(self, obj):
        return django_settings.STORE_NAME


class UsersAdminSerializer(serializers.ModelSerializer):

    avatar_image = Base64ImageField(required=False, allow_null=True)
    is_admin = serializers.BooleanField(read_only=False)
    is_active = serializers.BooleanField(read_only=False)
    is_staff = serializers.BooleanField(read_only=True)
    date_join = serializers.DateTimeField(read_only=True)
    avatar = serializers.SerializerMethodField()
    visit_datetime = serializers.SerializerMethodField()
    token = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = ('password',)

    def get_avatar(self, obj):
        if obj.avatar_image:
            return get_thumbnailer(obj.avatar_image)['avatar'].url

    def get_visit_datetime(self, obj):
        m = UserLog.objects.filter(user=obj).aggregate(Max('visit_datetime'))
        return m['visit_datetime__max']

    def get_token(self, obj):
        if obj.is_active:
            return None
        signer = Signer()
        return signer.signature(obj.email)


class UsersAdminSerializer2(serializers.Serializer):

    admin_password = serializers.CharField(required=False)
    password1 = serializers.CharField(min_length=6, required=False)
    password2 = serializers.CharField(min_length=6, required=False)

    def validate(self, data):
        err = {'password1': _("Password confirmation doesn't match Password"),
               'password2': _("Password confirmation doesn't match Password")}

        if 'password1' in data or 'password2' in data:
            if 'password1' not in data and 'password2' in data:
                raise serializers.ValidationError(err)

            if data['password1'] != data['password2']:
                raise serializers.ValidationError(err)

        return super(UsersAdminSerializer2, self).validate(data)


class UsersStaffSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email', 'phone', 'bio',
            'www_site', 'date_join', 'avatar_image', 'avatar'
        )

    date_join = serializers.DateTimeField(read_only=True)
    avatar = serializers.SerializerMethodField()
    avatar_image = Base64ImageField(required=False, allow_null=True)

    def get_avatar(self, obj):
        if obj.avatar_image:
            return get_thumbnailer(obj.avatar_image)['avatar'].url


class UserSessionSerializer(serializers.ModelSerializer):
        pk = serializers.PrimaryKeyRelatedField(
            queryset=User.objects.all()
        )


class SessionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserLog
        exclude = ('id', 'user', 'session')

    country = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    isp = serializers.SerializerMethodField()

    def get_country(self, obj):
        self.geo = GeoIP2()
        try:
            return self.geo.country(obj.ip)
        except:
            return 'Malta'

    def get_city(self, obj):
        self.geo = GeoIP2()
        try:
            return self.geo.city(obj.ip)
        except:
            return 'Sliema'

    def get_isp(self, obj):
        return 'Rostelecom'


# Customers
class SHPFPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'limit'

    def get_fields(self):
        import pdb
        pdb.set_trace()
        return super(SHPFSerializer, self).get_fields()

    def get_paginated_response(self, data):
        return Response(data)


class SHPFSerializer(serializers.ModelSerializer):
    def __init__(self, instance=None, data=empty, **kwargs):
        if data is not empty:
            data = data[data.keys()[0]]
        super(SHPFSerializer, self).__init__(instance, data, **kwargs)


class CustomerAddressSerializer(SHPFSerializer):
    default = serializers.BooleanField(read_only=True)
    country_name = serializers.CharField(read_only=True,
                                         source='get_country_code_display')
    province_name = serializers.CharField(read_only=True,
                                          source='get_province_code_display')

    class Meta:
        model = Address
        exclude = ('customer',)


class TagsField(serializers.ListField):
    child = serializers.CharField(label=_('Tags'), required=False,
                                  max_length=255, allow_blank=True,
                                  allow_null=True)


class CustomerSerializer(SHPFSerializer):
    tags = TagsField(required=False)
    email = serializers.EmailField(label=_('Email'), max_length=255,
                                   required=True, allow_null=False)
    first_name = serializers.CharField(label=_('First Name'), max_length=30,
                                       required=True, allow_null=False)
    last_name = serializers.CharField(label=_('Last Name'), max_length=30,
                                      required=True, allow_null=False)

    addresses = CustomerAddressSerializer(many=True, read_only=True)
    default_address = CustomerAddressSerializer(read_only=True)

    class Meta:
        model = Customer
        exclude = ()

    def get_field_names(self, declared_fields, info):
        meta_fields = set(super(CustomerSerializer, self)
                          .get_field_names(declared_fields, info))
        param = self.context['request'].query_params.get('fields', None)
        if param:
            fields = set(param.replace(' ', '').split(','))
            return fields.intersection(meta_fields)

        return meta_fields


class AddressSerializer(SHPFSerializer):
    default = serializers.BooleanField(read_only=True)

    class Meta:
        model = Address
        exclude = ('customer',)


# products
class ProductSerializer(SHPFSerializer):

    body_html = serializers.CharField(
        label=_('Description'),
        max_length=2048, required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = Product
        exclude = ()


class ImageUrlField(serializers.ImageField):
    def to_internal_value(self, data):
        try:
            URLValidator()(data)
        except ValidationError:
            raise ValidationError('Invalid Url')

        file_, http_message = urlretrieve(data)
        file_ = open(file_, 'rb')
        return super(ImageUrlField, self).to_internal_value(
            ContentFile(file_.read(), name=file_.name))


class ProductImageSerializer(SHPFSerializer):

    src = ImageUrlField(required=False)
    attachment = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = ProductImage
        read_only_fields = ('created_at', 'updated_at')
        exclude = ('product',)

    def update(self, instance, validated_data):
        if not validated_data.get('src'):
            validated_data['src'] = instance.src
        return super(ProductImageSerializer, self).update(
            instance, validated_data)
