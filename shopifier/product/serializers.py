from __future__ import unicode_literals

from rest_framework import serializers
from rest_framework.fields import empty

from product.models import Product


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        exclude = ()

    def __init__(self, instance=None, data=empty, **kwargs):
        if data is not empty:
            data = data[data.keys()[0]]
        super(ProductSerializer, self).__init__(instance, data, **kwargs)
