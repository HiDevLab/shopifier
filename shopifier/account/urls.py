from django.conf.urls import url, include
from django.views.generic.base import TemplateView

from rest_framework.routers import SimpleRouter, Route, DynamicDetailRoute
from rest_framework.routers import DefaultRouter

from account.views import *

router = DefaultRouter()
router.register(r'admin', UsersAdminViewSet)
router.register(r'sessions', SessionsViewSet)
router.register(r'staff', UsersStaffViewSet)

urlpatterns = [
    #Api1
    url(r'^account/login/$', LoginView.as_view(), name='api_login'),
    url(r'^api/password-reset/$', UserPasswordResetView.as_view(), name='api_password_reset'),
    #Api2
    url(r'^account/logout/$', LogoutView.as_view(), name='api_logout'),
    
    url(r'^api/password/change/$', PasswordChangeView.as_view(), name='api_password_change'),
    url(r'^api/user-invaite/$', UserInvaiteView.as_view(), name='api_invaite'),
    url(r'^api/user-activate/$', UserActivateView.as_view(), name='api_activate'),
    
    url(r'^api/password-reset-confirm/$', UserPasswordResetConfirmView.as_view(), name='api_password_reset_confirm'),
    
    url(r'^api/', include(router.urls)),
    url(r'^admin/(?P<template_name>.+)$', AdminTemplateView.as_view()),
    url(r'^$', TemplateView.as_view(template_name='admin/anonymous-base.html'), name='root'),
    url(r'^.*$', TemplateView.as_view(template_name='admin/anonymous-base.html'), name='root'),  
]

