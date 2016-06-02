from __future__ import unicode_literals

from django.db import models

from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers

from customer.models import Customer, Address
import pdb



class CustomerAddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address
        exclude = ('customer',)
    
    default = serializers.BooleanField(read_only=True)


class CustomerSerializer(serializers.ModelSerializer):
    
    addresses = CustomerAddressSerializer(many=True, read_only = True) #serializers.SerializerMethodField(read_only = True)
    default_address = CustomerAddressSerializer(read_only = True)
    
    class Meta:
        model = Customer
        exclude = ()

   
class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address
        exclude = ('customer',)
    
    default = serializers.BooleanField(read_only=True)
    