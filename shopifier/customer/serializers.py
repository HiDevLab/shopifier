from __future__ import unicode_literals

from django.db import models

from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.fields import empty

from customer.models import Customer, Address
import pdb

class SHPFSerializer(serializers.ModelSerializer): #features shpf API
    
    def __init__(self, instance=None, data=empty, **kwargs):
        if data is not empty:
            data = data[data.keys()[0]]   
        super(SHPFSerializer, self).__init__(instance, data, **kwargs)
 

class CustomerAddressSerializer(SHPFSerializer):

    default = serializers.BooleanField(read_only=True)
    country_name = serializers.CharField(read_only=True, source='get_country_code_display')

    class Meta:
        model = Address
        exclude = ('customer',)


class CustomerSerializer(SHPFSerializer):
    
    email = serializers.EmailField(label=_('Email'), max_length=255, required=True, allow_null=False)
    first_name = serializers.CharField(label=_('First Name'), max_length=30, required=True, allow_null=False)
    last_name = serializers.CharField(label=_('Last Name'), max_length=30, required=True, allow_null=False)
    
    addresses = CustomerAddressSerializer(many=True, read_only = True) #serializers.SerializerMethodField(read_only = True)
    default_address = CustomerAddressSerializer(read_only = True)
        
    class Meta:
        model = Customer
        exclude = ()
    

class AddressSerializer(serializers.ModelSerializer):

    default = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Address
        exclude = ('customer',)
    
    
    