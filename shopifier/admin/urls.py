from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static

from rest_framework.routers import SimpleRouter, DefaultRouter

from shopifier.admin import views

router_account = DefaultRouter()
router_account.register(r'admin', views.UsersAdminViewSet)
router_account.register(r'staff', views.UsersStaffViewSet)


class JsonRouter(SimpleRouter):

    def __init__(self, trailing_slash=True):
        self.trailing_slash = '.json'
        super(SimpleRouter, self).__init__()


router = JsonRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'users', views.UsersAPIViewSet)
router.register(
    r'products/(?P<product_id>\d+)/images', views.ProductImageViewSet)
router.register(
    r'products/(?P<product_id>\d+)/variants', views.ProductVariantViewSet)
router.register(r'customers', views.CustomerViewSet)
router.register(
    r'customers/(?P<customer_id>\d+)/addresses', views.AddressViewSet)


urlpatterns = [
    url(r'^admin/templates/(?P<template_name>.+)$',
        views.AdminTemplateView.as_view()),
    url(r'^api/login/$',
        views.LoginView.as_view(), name='api_login'),
    url(r'^api/logout/$',
        views.LogoutView.as_view(), name='api_logout'),
    url(r'^api/current-user/$',
        views.CurrentUserView.as_view(), name='api_current_user'),
    url(r'^api/password/change/$',
        views.PasswordChangeView.as_view(), name='api_password_change'),
    url(r'^api/user-invite/$',
        views.UserInviteView.as_view(), name='api_invaite'),
    url(r'^api/user-decline/$',
        views.UserDeclineInviteView.as_view(), name='api_decline'),
    url(r'^api/recover/$',
        views.UserPasswordRecoverView.as_view(), name='api_recover'),
    url(r'^api/user-activate/$',
        views.UserActivateView.as_view(), name='api_activate'),
    url(r'^api/check_token1/$',
        views.UserCheckToken1View.as_view(), name='api_check_token1'),
    url(r'^api/check_token2/$',
        views.UserCheckToken2View.as_view(), name='api_check_token2'),
    url(r'^api/reset/$',
        views.UserPasswordResetView.as_view(), name='api_reset'),
    url(r'^api/sessions-expire/$',
        views.SessionsExpire.as_view(), name='sessions-expire'),
    url(r'^api/', include(router_account.urls)),
    url(r'^admin/', include(router.urls)),
    url(r'^admin/.*$',
        views.TemplateView.as_view(template_name='admin/admin-base.html'),
        name='shopifier-admin')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
