from __future__ import unicode_literals

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.messages import get_messages
from django.core.validators import validate_email, ValidationError
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils.timezone import now

from rest_framework import permissions, mixins
from rest_framework.decorators import detail_route
from rest_framework.generics import *
from rest_framework.response import Response
from rest_framework.status import *
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.serializers import *

from django.core.signing import Signer
from django.core.mail import send_mail

from account.serializers import *
from account.models import *
import pdb


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer
    
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(**serializer.validated_data)
        
        if user:
            login(request, user)
            return Response({'success': 'User logged in'}, status=HTTP_200_OK)
        else:
            content = {'detail': 'Unable to login with provided credentials'}
            return Response(content, status=HTTP_401_UNAUTHORIZED)


class PasswordChangeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PasswordChangeSerializer
    
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if not request.user.check_password(serializer.data['old_password']):
            content = {'status': 'Current password is wrong'}
            return Response(content, status=HTTP_400_BAD_REQUEST)
        
        request.user.set_password(serializer.data['password'])
        request.user.save(update_fieldsBaseSerializer=('password',))
        
        return Response(status=HTTP_204_NO_CONTENT)

        
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, format=None):
        logout(request)
        content = {'success': 'User logged out.'}
        return Response(content, status=HTTP_200_OK)

def get_token(email):
    signer = Signer()
    return signer.signature(email)

    
class  UserInvaiteView(CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserInvaiteSerializer
    
    email_html_template_name = 'email.html'    
    email_text_template_name = 'email.txt'

    def perform_create(self, serializer):
        user = serializer.save()          
        ref_url = 'http://127.0.0.1:8000/api/user-activate/?pk={}&token={}'.format(user.id, get_token(user.email))
        #ref_url = 'http://127.0.0.1:8000/api/confirm-email/{}/{}/'.format(user.id, self.get_token(user.email))
        #user-activate?pk=\d+&token=[\w.@+-_]+)/
        txt_body = render_to_string(self.email_text_template_name,
                                    {'reference': ref_url})
        html_body = render_to_string(self.email_html_template_name,
                                    {'reference': ref_url})
        send_mail(
            recipient_list = [user.email],
            subject = 'Welcome to Shopifier', 
            message=txt_body,
            html_message=html_body,
            from_email = settings.DEFAULT_FROM_EMAIL ,
            fail_silently = True,
        )
        user.is_active = False
        user.is_admin = False
        user.save()
        return user    
        
        
class  UserConfimView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserConfimSerializer    
    
    def get(self, request, format=None):
        
        serializer = self.serializer_class(data=request.GET)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['pk']
        if get_token(user.email) != serializer.validated_data['token']:
            return Response({'details': 'Wrong Token'}, status=HTTP_400_BAD_REQUEST)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=HTTP_200_OK)

class UserActivateView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserActivateSerializer
        
    def post(self, request, format=None):
        #pdb.set_trace()
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['pk']
        if get_token(user.email) != serializer.validated_data['token']:
            return Response({'details': 'Wrong Token'}, status=HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['password'])
        user.is_active = True
        user.is_staff = True
        user.save()
        
        user = authenticate(**serializer.validated_data)
        if user:
            login(request, user)
        return Response({'success': 'User logged in'}, status=HTTP_200_OK)
















"""

    def get_object(self):
        print sel.user
        return self.user

    def dispatch(self, request, *args, **kwargs):
        
        self.user = User.objects.get(pk=kwargs.get('pk', None))
        if self.user == None:
            raise Http404("Invalid confirm email information")
        
        signer = Signer()
        s1 = signer.signature(self.user)
        s2 = kwargs.get('sign_user', None)
        
        if self.user.is_active == True:
            raise Http404("Account is active yet!")
        if s1<>s2:
            raise Http404("Invalid confirm email information")
        #self.serializparameter nameser_class.instance = self.user    
        return super(EmailUserConfirmView, self).dispatch(request, *args, **kwargs)
    
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        self.user.set_password(serializer.data['password1'])
        self.user.first_name(serializer.data['first_name'])
        self.user.last_name(serializer.data['last_name'])
        self.user.is_active = True
        self.user.is_staff = True
        self.user.save()
        return Response(status=HTTP_204_NO_CONTENT)
    
"""


