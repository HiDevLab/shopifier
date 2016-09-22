from django.utils.translation import ugettext_lazy as _

from rest_framework import permissions
from rest_framework.status import HTTP_200_OK
from rest_framework.viewsets import ModelViewSet

from product.serializers import ProductSerializer
from product.models import Product


class ProductViewSet(ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

    def list(self, request, *args, **kwargs):
        response = super(ProductViewSet, self).list(request, *args, **kwargs)
        response.data = {'products': response.data}
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(ProductViewSet, self).retrieve(
            request, *args, **kwargs)
        response.data = {'product': response.data}
        return response

    def create(self, request, *args, **kwargs):
        response = super(ProductViewSet, self).create(request, *args, **kwargs)
        response.data = {'product': response.data}
        return response

    def update(self, request, *args, **kwargs):
        response = super(ProductViewSet, self).update(request, *args, **kwargs)
        response.data = {'product': response.data}
        return response

    def destroy(self, request, *args, **kwargs):
        response = super(ProductViewSet, self).destroy(
            request, *args, **kwargs)
        response.status = HTTP_200_OK

        return response