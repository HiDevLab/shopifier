from __future__ import unicode_literals
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import password_validation
from django.template.loader import render_to_string
from easy_thumbnails.files import get_thumbnailer
from django.contrib.gis.geoip2 import GeoIP2

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

class UsersAdminSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields=('id', 'first_name', 'last_name', 'email', 
                'phone', 'bio', 'www_site', 'date_join', 'avatar_image', 'avatar', 'is_admin', 'is_active', 'is_staff')

    is_admin = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    date_join = serializers.DateTimeField(read_only=True)
    avatar = serializers.SerializerMethodField()
    
    def get_avatar(self, obj):
        if obj.avatar_image:
            return get_thumbnailer(obj.avatar_image)['avatar'].url
            #options = {'size': (100, 100), 'crop': True}
            #thumb_url = get_thumbnailer(profile.photo).get_thumbnail(options).url

class UsersStaffSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields=('id', 'first_name', 'last_name', 'email', 
                'phone', 'bio', 'www_site', 'date_join', 'avatar_image', 'avatar')

    date_join = serializers.DateTimeField(read_only=True)
    avatar = serializers.SerializerMethodField()
    
    def get_avatar(self, obj):
        if obj.avatar_image:
            return get_thumbnailer(obj.avatar_image)['avatar'].url


class SessionsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserLog
        fields=('user', 'full_name', 'visit_datetime', 'ip', 'country', 'city', 'session')

    full_name = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    
#    def __init__(self, instance=None, data=empty, **kwargs):
#        super(SessionsSerializer, self).__init__(instance, data, **kwargs)
#        self.geo = GeoIP2()
        
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    
    def get_country(self, obj):
        self.geo = GeoIP2()
        try:
            return self.geo.country(obj.ip)
        except:
            return None

    def get_city(self, obj):
        self.geo = GeoIP2()
        try:
            return self.geo.city(obj.ip)
        except:
            return None
