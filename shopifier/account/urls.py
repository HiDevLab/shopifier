from django.conf.urls import url, include
from django.views.generic.base import RedirectView

from rest_framework.routers import DefaultRouter

from account.views import *


router = DefaultRouter()
router.register(r'admin', UsersAdminViewSet)
router.register(r'staff', UsersStaffViewSet)


urlpatterns = [
    #Angular
  #  url(r'^admin/auth/login/$', LoginView.as_view(), name='api_login'),
   # url(r'^admin/auth/logout/$', LogoutView.as_view(), name='api_logout'),
    url(r'^admin/templates/(?P<template_name>.+)$', AdminTemplateView.as_view()),
    
    #Api
    url(r'^api/login/$', LoginView.as_view(), name='api_login'),
    url(r'^api/logout/$', LogoutView.as_view(), name='api_logout'),
    url(r'^api/current-user/$', CurrentUserView.as_view(), name='api_current_user'),
    url(r'^api/password/change/$', PasswordChangeView.as_view(), name='api_password_change'),
    url(r'^api/user-invite/$', UserInviteView.as_view(), name='api_invaite'),
    url(r'^api/recover/$', UserPasswordRecoverView.as_view(), name='api_recover'),
    url(r'^api/user-activate/$', UserActivateView.as_view(), name='api_activate'),
    url(r'^api/check_token2/$', UserCheckToken2View.as_view(), name='api_check_token2'),
    url(r'^api/reset/$', UserPasswordResetView.as_view(), name='api_reset'),
    url(r'^api/sessions-expire/$', SessionsExpire.as_view(), name='sessions-expire'),
    url(r'^api/', include(router.urls)),
    
    url(r'^admin/.*$', TemplateView.as_view(template_name='admin/admin-base.html'), name='shopifier-admin'),
    url(r'^.*$', RedirectView.as_view(url='/admin/')),  # url for future shopifier
]
