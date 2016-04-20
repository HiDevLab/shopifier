from __future__ import unicode_literals

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.messages import get_messages
from django.core.mail import send_mail
from django.core.validators import validate_email, ValidationError
from django.db import transaction
from django.db.utils import IntegrityError
from django.template.loader import render_to_string
from django.utils.timezone import now

from rest_framework import permissions, mixins
from rest_framework.decorators import detail_route
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.status import *
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from account.serializers import *
from account.models import *


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
