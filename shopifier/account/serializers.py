from __future__ import unicode_literals
from django.conf import settings
from rest_framework import serializers

from account.models import *

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(max_length=128)

