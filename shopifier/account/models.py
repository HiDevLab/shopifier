from __future__ import unicode_literals

import os
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.contrib.sessions.models import Session
from django.contrib.auth.signals import user_logged_in

__all__ = [
    'user_log',
    'UserManager',
    'User',
    'UserLog',
]

def user_log(sender, user, request, **kwargs):
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip = request.META.get('REMOTE_ADDR', xff.split(',')[0]) or None

    request.session.modified = True
    request.session.save()
    s = Session.objects.get(pk=request.session.session_key)
    UserLog.objects.create(user=user, session=s, ip=ip)
    
user_logged_in.connect(user_log)


class UserManager(BaseUserManager):
    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
            
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.is_admin = False
        user.is_staff = False
        user.is_active = False
        user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
            
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.save(using=self._db)
        return user

def normalization_file_name(instance, filename):
    return "avatar/img{}".format(os.path.splitext(filename)[1])

class User(AbstractBaseUser):
    first_name = models.CharField(_('first name'), max_length=30, blank=False)
    last_name = models.CharField(_('last name'), max_length=30, blank=False)
    email = models.EmailField(_('email address'), max_length=254, unique=True, blank=False)
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    phone = models.CharField(_('Phone (optional)'), max_length=30, blank=True)
    www_site = models.CharField(_('Personal website address (optional)'), max_length=30, blank=True)
    bio = models.TextField(_('Bio (optional)'),blank=True,  max_length=2048)
    avatar_image = models.ImageField(_('Portfile photo'), blank=True, upload_to=normalization_file_name)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(_('staff status'), default=False,)
    is_admin = models.BooleanField(default=False)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name

    def __unicode__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True
    
    #def email_user(self, subject, message, from_email=None, **kwargs):
    #    send_mail(subject, message, from_email, [self.email], **kwargs)
    
    @property
    def username(self):
        "Username"
        return self.email
        
        
class UserLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session= models.ForeignKey(Session, null=True, on_delete=models.SET_NULL)
    ip = models.GenericIPAddressField(null=True)
    visit_datetime = models.DateTimeField(null=True, default=timezone.now)
    
    class Meta:
        ordering = ['-visit_datetime', 'id']
        
    @property
    def is_active(self):
        "Is the session active?"
        return self.session <> None

