from django.conf.urls import url, include
from django.views.generic import TemplateView

from rest_framework.routers import SimpleRouter, Route, DynamicDetailRoute
from rest_framework.routers import DefaultRouter

from account.views import *

router = DefaultRouter()
router.register(r'admin', UsersAdminViewSet)
router.register(r'sessions', SessionsViewSet)
router.register(r'staff', UsersStaffViewSet)

urlpatterns = [
    #Api
    url(r'^api/login/$', LoginView.as_view(), name='api_login'),
    url(r'^api/logout/$', LogoutView.as_view(), name='api_logout'),
    url(r'^api/password/change/$', PasswordChangeView.as_view(), name='api_password_change'),
    url(r'^api/user-invaite/$', UserInvaiteView.as_view(), name='api_invaite'),
    url(r'^api/user-confim/$', UserConfimView.as_view(), name='api_confirm'),
    url(r'^api/user-activate/$', UserActivateView.as_view(), name='api_activate'),
    url(r'^api/', include(router.urls)),
    
]

