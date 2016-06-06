from __future__ import unicode_literals

from django.db import models

from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers

from customer.models import Customer, Address
import pdb



class CustomerAddressSerializer(serializers.ModelSerializer):

    default = serializers.BooleanField(read_only=True)

    class Meta:
        model = Address
        exclude = ('customer',)
        

class CustomerSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField(max_length=255, required=True, allow_null=False)
    first_name = serializers.CharField(min_length=6, max_length=128, required=True, allow_null=False)
    last_name = serializers.CharField(max_length=128, required=True, allow_null=False)
    
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
    
    
    