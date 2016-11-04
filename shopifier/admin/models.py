from __future__ import unicode_literals

import os
from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.contrib.sessions.models import Session
from django.contrib.auth.signals import user_logged_in

from pycountry import countries, subdivisions

from shopifier.admin.tags import TagField, TagQuerySet


# accounts
def user_log(sender, user, request, **kwargs):
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip = request.META.get('REMOTE_ADDR', xff.split(',')[0]) or None

    request.session.modified = True
    request.session.save()
    s = Session.objects.get(pk=request.session.session_key)
    user_log = UserLog.objects.create(user=user, session=s, ip=ip)
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
    email = models.EmailField(
        _('email address'), max_length=254, unique=True, blank=False
    )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    phone = models.CharField(_('Phone (optional)'), max_length=30, blank=True)
    www_site = models.CharField(
        _('Personal website address (optional)'), max_length=30, blank=True
    )
    bio = models.TextField(
        _('Bio (optional)'), blank=True, max_length=2048
    )
    avatar_image = models.ImageField(
        _('Portfile photo'), blank=True, upload_to=normalization_file_name
    )

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

    @property
    def username(self):
        "Username"
        return self.email


class UserLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, null=True, on_delete=models.SET_NULL)
    ip = models.GenericIPAddressField(null=True)
    visit_datetime = models.DateTimeField(null=True, default=timezone.now)

    class Meta:
        ordering = ['-visit_datetime', 'id']

    @property
    def is_active(self):
        "Is the session active?"
        return self.session is not None


# Customers
class Customer(models.Model):

    STATES = (
        ('disabled', 'disabled'),
        ('decline', 'decline'),
        ('invited', 'invited'),
    )

    accepts_marketing = models.BooleanField(
        _('Customer accepts marketing'), default=False
    )
    created_at = models.DateTimeField(
        _('When the customer was created'), default=timezone.now
    )
    default_address = models.OneToOneField(
        'Address', related_name='+', null=True
    )
    email = models.EmailField(
        _('Email'), max_length=254, blank=True, unique=True
    )
    first_name = models.CharField(_('First Name'), max_length=30, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=30, blank=True)
    note = models.TextField(_('Notes'), blank=True, max_length=254)
    state = models.CharField(
        max_length=20, choices=STATES, default='disabled'
    )
    tags = TagField()
    tax_exempt = models.BooleanField(
        _('Customer is tax exempt'), default=True
    )
    updated_at = models.DateTimeField(
        _('Information was updated'), default=timezone.now
    )
    verified_email = models.BooleanField(default=True)
    objects = TagQuerySet.as_manager()

    @property
    def name(self):
        return '{} {}'.format(self.first_name, self.last_name)


class Address(models.Model):
    EXTRA_COUNTRY_CHOICES = [
        ('XK', _('Kosovo')),
    ]

    COUNTRY_CHOICES = [(c.alpha2, getattr(c, 'common_name', c.name))
                       for c in countries]
    PROVINCE_CHOICES = [(c.code, c.name) for c in subdivisions]

    customer = models.ForeignKey(Customer, related_name='addresses')
    address1 = models.CharField(_('Address'), blank=True, max_length=254)
    address2 = models.CharField(_("Address Con't"), blank=True, max_length=254)
    first_name = models.CharField(_('First Name'), max_length=30, blank=True)
    last_name = models.CharField(_('Last Name'), max_length=30, blank=True)
    phone = models.CharField(_('Phone'), max_length=30, blank=True)
    city = models.CharField(_('City'), blank=True, null=True, max_length=54)
    company = models.CharField(_('Company'), blank=True, max_length=254)
    country_code = models.CharField(
        _('Coutry'), max_length=2, choices=COUNTRY_CHOICES, null=True
    )
    province = models.CharField(_('Region'), blank=True, max_length=254)
    province_code = models.CharField(
        _('Region'), max_length=10, choices=PROVINCE_CHOICES, blank=True
    )
    zip = models.CharField(_('Postal / Zip Code'), blank=True, max_length=20)

    @property
    def default(self):
        return self.customer.default_address_id == self.id


# products
class Product(models.Model):

    body_html = models.TextField(
        _('Description'), blank=False, max_length=2048)
    title = models.TextField(_('Title'), blank=False, max_length=254)
