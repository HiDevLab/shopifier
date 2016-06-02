from django.conf.urls import url, include

from rest_framework.routers import Route, DynamicListRoute, DynamicDetailRoute, SimpleRouter

from customer.views import *


class JsonRouter(SimpleRouter):

    def __init__(self, trailing_slash=True):
        self.trailing_slash = '.json'
        super(SimpleRouter, self).__init__()


router = JsonRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'customers/(?P<customer_id>\d+)/addresses', AddressViewSet)

urlpatterns = [
    url(r'^admin/', include(router.urls)),
]
