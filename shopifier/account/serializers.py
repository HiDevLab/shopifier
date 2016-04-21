from __future__ import unicode_literals
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import password_validation
from django.template.loader import render_to_string

from account.models import *

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(max_length=128)

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(min_length=6)
    password = serializers.CharField(min_length=6)


class UserInvaiteSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')


class UserConfimSerializer(serializers.Serializer):
    pk = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_active=True))
    token = serializers.CharField(max_length=32)


class UserActivateSerializer(serializers.Serializer):
    pk = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.exclude(is_active=True))
    email = serializers.EmailField(max_length=255)
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    phone = serializers.CharField(max_length=128)
    password = serializers.CharField(max_length=128)
    token = serializers.CharField(max_length=32)


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        exclude = ('is_admin', 'is_active', 'is_staff')
