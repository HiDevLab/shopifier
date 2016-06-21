from __future__ import unicode_literals

from django.db import models

from django.db.models.fields import FieldDoesNotExist
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import empty
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from customer.models import Customer, Address


class SHPFPagination(PageNumberPagination):
    page_query_param = 'page'
    page_size_query_param = 'limit'
    
    def get_fields(self):
        import pdb
        pdb.set_trace()
        return super(SHPFSerializer, self).get_fields()
        
    
    def get_paginated_response(self, data):
        return Response(data)


class SHPFSerializer(serializers.ModelSerializer): #features shpf API
    
    def __init__(self, instance=None, data=empty, **kwargs):
        if data is not empty:
            data = data[data.keys()[0]]   
        super(SHPFSerializer, self).__init__(instance, data, **kwargs)
 

class CustomerAddressSerializer(SHPFSerializer):

    default = serializers.BooleanField(read_only=True)
    country_name = serializers.CharField(read_only=True, source='get_country_code_display')
    province_name = serializers.CharField(read_only=True, source='get_province_code_display')

    class Meta:
        model = Address
        exclude = ('customer',)


class TagsField(serializers.ListField):
    child = serializers.CharField(label=_('Tags'), required=False, max_length=255, allow_blank=True, allow_null=True)


class CustomerSerializer(SHPFSerializer):
    
    tags = TagsField()
    email = serializers.EmailField(label=_('Email'), max_length=255, required=True, allow_null=False)
    first_name = serializers.CharField(label=_('First Name'), max_length=30, required=True, allow_null=False)
    last_name = serializers.CharField(label=_('Last Name'), max_length=30, required=True, allow_null=False)
    
    addresses = CustomerAddressSerializer(many=True, read_only = True) #serializers.SerializerMethodField(read_only = True)
    default_address = CustomerAddressSerializer(read_only = True)
        
    class Meta:
        model = Customer
        exclude = ()
    
    def get_field_names(self, declared_fields, info):
        meta_fields = set(super(CustomerSerializer, self).get_field_names(declared_fields, info))
        param = self.context['request'].query_params.get('fields', None) 
        if param:
            fields = set(param.replace(' ','').split(',')) 
            #if len(fields.difference(meta_fields))>0:
                #msg = 'Fields:{} not exists'.format(', '.join(str(f) for f in fields.difference(meta_fields)))
                #raise ValidationError(detail = msg)
                #raise ObjectDoesNotExist('Field:{} not exists'.format(field))
                
            return fields.intersection(meta_fields)

        return meta_fields

class AddressSerializer(SHPFSerializer):

    default = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Address
        exclude = ('customer',)