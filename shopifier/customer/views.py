from django.core.signing import Signer
from django.utils.translation import ugettext_lazy as _

from rest_framework.decorators import list_route
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from customer.serializers import *
from customer.models import *
from serializers import AddressSerializer


# features shpf API
class SHPFViewSet(ModelViewSet):
    REPR = {
            'Customer': {
                        'list': 'customers',
                        'nonlist': 'customer',
                        },
            'Address': {
                       'list': 'addresses',
                       'nonlist': 'customer_address',
                    },

            }

    def __init__(self, *args, **kwargs):
        self.repr = self.REPR[self.queryset.model.__name__]
        super(SHPFViewSet, self).__init__(*args, **kwargs)

    def list(self, request, *args, **kwargs):
        response = super(SHPFViewSet, self).list(request, *args, **kwargs)
        response.data = {self.repr['list']: response.data}
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(SHPFViewSet, self).retrieve(request, *args, **kwargs)
        response.data = {self.repr['nonlist']: response.data}
        return response

    def create(self, request, *args, **kwargs):
        response = super(SHPFViewSet, self).create(request, *args, **kwargs)
        response.data = {self.repr['nonlist']: response.data}
        return response

    def update(self, request, *args, **kwargs):
        response = super(SHPFViewSet, self).update(request, *args, **kwargs)
        response.data = {self.repr['nonlist']: response.data}
        return response

    def destroy(self, request, *args, **kwargs):
        response = super(SHPFViewSet, self).destroy(request, *args, **kwargs)
        response.status = HTTP_200_OK
        return response


def get_token(email):
    signer = Signer()
    return signer.signature(email)


class CustomerViewSet(SHPFViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Customer.objects.all().order_by('id')
    serializer_class = CustomerSerializer

    def filter_queryset(self, queryset):
        since_id = self.request.query_params.get('since_id', None)
        if since_id:
            return Customer.objects.filter(id__gt=since_id).order_by('id')

        before_id = self.request.query_params.get('before_id', None)
        if before_id:
            return Customer.objects.filter(id__lt=before_id).order_by('-id')

        return super(CustomerViewSet, self).filter_queryset(queryset)

    @detail_route(methods=['post'])
    def account_activation_url(self, request, pk=None):
        customer = self.get_object()
        if customer.state != 'disabled':
            content = {
                "errors": ["account already active"]
            }
            return Response(content, status=422)

        url = '{}/account/activate/{}/{}/'.format(settings.SITE, customer.id,
                                                  get_token(customer.email))
        content = {
            'account_activation_url': url,
        }
        return Response(content, status=HTTP_200_OK)

    @list_route(methods=['get'])
    def count(self, request, pk=None):
        count = Customer.objects.all().count()
        content = {
            'count': count,
        }
        return Response(content, status=HTTP_200_OK)

    @list_route(methods=['get'])
    def tags(self, request, pk=None):
        tags = Customer.objects.count_tag_values('tags')
        content = {
            'tags': tags,
        }
        return Response(content, status=HTTP_200_OK)


class AddressViewSet(SHPFViewSet):
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
            content = {'errors': {
                    'base': ['Cannot delete the customers default address']
                    }}
            return Response(content, status=422)

        self.perform_destroy(instance)
        return Response(status=HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.validated_data['customer'] = self.customer
        serializer.save()
