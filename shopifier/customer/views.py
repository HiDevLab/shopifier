from django.shortcuts import render

from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from rest_framework import permissions, mixins
from rest_framework.decorators import detail_route
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.serializers import *
from rest_framework.status import *
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.viewsets import GenericViewSet

from customer.serializers import *
from customer.models import *
from serializers import AddressSerializer
from django.core.serializers import serialize


class APIViewSet(ModelViewSet):
    
    def __init__(self, shopify=None, *args, **kwargs):
        self.shopify = shopify



class CustomerViewSet(APIViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Customer.objects.all().order_by('id')
    serializer_class = CustomerSerializer

class AddressViewSet(ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Address.objects.all().order_by('customer')
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        qs = super(AddressViewSet, self).get_queryset()
        return qs.filter(customer=self.customer)
    
    def dispatch(self, request, *args, **kwargs):
        self.customer = get_object_or_404(Customer, id=kwargs['customer_id'])
        return super(AddressViewSet, self).dispatch(request, *args, **kwargs)

    @detail_route(methods=['put'])
    def default(self, request, customer_id=None, pk=None):
        address = self.get_object()
        serializer = self.serializer_class(address)
        self.customer.default_address = address
        self.customer.save(update_fields=('default_address',)) 
        content = {'customer_address': serializer.data}
        return Response(content, status=HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.default:
            content = { "errors": { 
                                   "base": ["Cannot delete the customers default address"]
                                   }
                       }
            return Response(content, status=422)
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.validated_data['customer'] = self.customer
        serializer.save()
    
    def list(self, request, *args, **kwargs):
        response = super(AddressViewSet, self).list(request, *args, **kwargs)
        response.data = { 'addresses': response.data }
        return response
        
    def retrieve(self, request, *args, **kwargs):
        response = super(AddressViewSet, self).retrieve(request, *args, **kwargs)
        response.data = { 'customer_address': response.data }
        return response
    
        
    def create(self, request, *args, **kwargs):
        response = super(AddressViewSet, self).create(request, *args, **kwargs)
        response.data = { 'address': response.data }
        return response
    
    def update(self, request, *args, **kwargs):
        response = super(AddressViewSet, self).update(request, *args, **kwargs)
        response.data = { 'customer_address': response.data }
        return response
    
    
