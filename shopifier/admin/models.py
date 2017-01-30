from __future__ import unicode_literals

import os
from user_agents import parse

from django.db import models
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.signals import user_logged_in
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.sessions.models import Session
from django.utils.translation import ugettext_lazy as _

from pycountry import countries, subdivisions

from shopifier.admin.tags import TagField, TagQuerySet


def now():
    return timezone.localtime(timezone.now())


# accounts
def user_log(sender, user, request, **kwargs):
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    ip = request.META.get('REMOTE_ADDR', xff.split(',')[0]) or None
    request.session.modified = True
    request.session.save()
    s = Session.objects.get(pk=request.session.session_key)
    user_agent = parse(request.META.get('HTTP_USER_AGENT'))
    UserLog.objects.create(
        user=user, session=s, ip=ip, user_agent=str(user_agent))

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
    return 'avatar/img{}'.format(os.path.splitext(filename)[1])


class User(AbstractBaseUser):
    first_name = models.CharField(_('first name'), max_length=30, blank=False)
    last_name = models.CharField(_('last name'), max_length=30, blank=False)
    email = models.EmailField(
        _('email address'), max_length=254, unique=True, blank=False
    )
    date_joined = models.DateTimeField(_('date joined'), default=now)
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
    receive_announcements = models.BooleanField(
        _('Allow important notifications to be sent by email'), default=False)
    permissions = ArrayField(
        models.CharField(max_length=20, blank=False), default=['full'])

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
    visit_datetime = models.DateTimeField(null=True, default=now)
    user_agent = models.CharField(blank=True, max_length=254)

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
        _('When the customer was created'), default=now
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
        _('Information was updated'), default=now
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
def default_options():
    return [{'Size': []}]


class Product(models.Model):

    body_html = models.TextField(
        _('Description'),  max_length=2048, blank=True)
    created_at = models.DateTimeField(blank=True, null=True)
    handle = models.CharField(blank=True, max_length=254)
    options = JSONField(blank=True, null=True)
    product_type = models.CharField(
        _('Product type'), blank=True, max_length=254)
    published_at = models.DateTimeField(blank=True, null=True)
    published_scope = models.CharField(
        _('The sales channels in which the product is visible'),
        default='global', blank=True, max_length=254)
    tags = TagField(default=[])
    template_suffix = models.CharField(
        _('The suffix of the liquid template being used'),
        blank=True, max_length=254)
    title = models.TextField(_('Title'), blank=False, max_length=254)
    metafields_global_title_tag = models.TextField(blank=True, max_length=254)
    metafields_global_description_tag = models.TextField(
        blank=True, max_length=254)
    updated_at = models.DateTimeField(blank=True, null=True)
    vendor = models.TextField(_('Vendor'), blank=True, max_length=254)


def normalization_img_file_name(instance, filename):
    return 'products/{}/img{}'.format(
        instance.product.title, os.path.splitext(filename)[1])


class ProductImage(models.Model):

    product = models.ForeignKey(Product, related_name='images')
    created_at = models.DateTimeField(blank=True, null=True)
    position = models.IntegerField()
    src = models.ImageField(upload_to=normalization_img_file_name)
    updated_at = models.DateTimeField(default=now)
    alt_text = models.CharField(
        _('Image alt text'), blank=True, max_length=254)

    class Meta:
        ordering = ['product', 'position']


class ProductVariant(models.Model):

    barcode = models.CharField(
        _('Barcode (ISBN, UPC, GTIN, etc.)'), blank=True, max_length=15)
    compare_at_price = models.DecimalField(
        _('Compare at price)'), max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(blank=True, null=True)
    fulfillment_service = models.CharField(
        _('FULFILLMENT SERVICE'),
        choices=(
            ('manual', 'Manual'),
            ('choice_fulfillment', 'Choice Fulfillment')),
        default='manual', max_length=15
    )
    grams = models.IntegerField(_('Weight'), default=0)
    image = models.ForeignKey(ProductImage, related_name='variants', null=True)
    inventory_management = models.CharField(
        _('Inventory policy'),
        choices=(
            ('', "Don't track inventory"),
            ('shopifier', "Shopifier tracks this product's inventory")),
        default='shopifier', max_length=15, blank=True
    )
    inventory_policy = models.CharField(
        _("Allow customers to purchase this product when it's out of stock"),
        choices=(
            ('deny', 'deny'),
            ('continue', 'continue')),
        default='deny', max_length=15
    )
    inventory_quantity = models.IntegerField(_('Quantity'), default=0)
    old_inventory_quantity = models.IntegerField(default=0)
    inventory_quantity_adjustment = models.IntegerField(default=0)
#     metafield
    option1 = models.CharField(blank=True, null=True, max_length=254)
    option2 = models.CharField(blank=True, null=True, max_length=254)
    option3 = models.CharField(blank=True, null=True, max_length=254)
    position = models.IntegerField()
    price = models.DecimalField(_('Price)'), max_digits=10, decimal_places=2)
    product = models.ForeignKey(Product, related_name='variants')
    requires_shipping = models.BooleanField(
        _('This product requires shipping'), default=True)
    sku = models.CharField(
        _('SKU (Stock Keeping Unit)'), blank=True, max_length=50)
    taxable = models.BooleanField(
        _('Charge taxes on this product'), default=False)
    title = models.TextField(_('Title'), blank=True, max_length=254)
    updated_at = models.DateTimeField(default=now)
    weight = models.FloatField(_('Weight'), default=0)
    weight_unit = models.CharField(
        choices=(('lb', 'lb'), ('oz', 'oz'), ('kg', 'kg'), ('g', 'g')),
        default='kg', max_length=5
    )

    class Meta:
        ordering = ['product', 'position']


# CustomCollection
def normalization_img_collection_file_name(instance, filename):
    return 'collections/{}/img{}'.format(
        instance.customcollection.title, os.path.splitext(filename)[1])


class CollectionImage(models.Model):
    src = models.ImageField(
        upload_to=normalization_img_collection_file_name, null=True)
    created_at = models.DateTimeField(default=now)


class CustomCollection(models.Model):

    SORT_ORDERS = (
        ('alpha-asc', 'Alphabetically, in ascending order (A - Z)'),
        ('alpha-desc', 'Alphabetically, in descending order (Z - A)'),
        ('best-selling', 'By best-selling products'),
        ('created', 'By date created, in ascending order (oldest - newest)'),
        (
            'created-desc',
            'By date created, in descending order (newest - oldest)'
        ),
        ('manual', 'Order created by the shop owner'),
        ('price-asc', 'By price, in ascending order (lowest - highest)'),
        ('price-desc', 'By price, in descending order (highest - lowest)'))

    body_html = models.TextField(_('Description'),  max_length=2048)
    handle = models.CharField(blank=True, max_length=254)
    image = models.ForeignKey(
        CollectionImage, null=True, related_name='collection')
#     metafield
    published = models.BooleanField(default=True)
    published_at = models.DateTimeField(blank=True, null=True)
    published_scope = models.CharField(
        _('The sales channels in which the custom collection is visible'),
        default='global', blank=True, max_length=254)
    sort_order = models.CharField(
        max_length=56, choices=SORT_ORDERS, default='alpha-asc')
    template_suffix = models.CharField(
        _('The suffix of the liquid template being used'),
        blank=True, max_length=254)
    title = models.TextField(_('Title'), blank=True, max_length=254)
    updated_at = models.DateTimeField(default=now)


class Collect(models.Model):
    collection = models.ForeignKey(CustomCollection, related_name='collects')
    created_at = models.DateTimeField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    position = models.IntegerField()
    product = models.ForeignKey(Product, related_name='collects')
#     sort_value =
    updated_at = models.DateTimeField(default=now)
