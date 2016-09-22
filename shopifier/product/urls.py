from django.conf.urls import url, include

from rest_framework.routers import SimpleRouter

from customer.urls import JsonRouter
from product import views


router = JsonRouter()
router.register(r'products', views.ProductViewSet)

urlpatterns = [
    url(r'^admin/', include(router.urls)),
]