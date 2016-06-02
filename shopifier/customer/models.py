from __future__ import unicode_literals

from django.db import models
from django.utils import timezone

from django.utils.translation import ugettext_lazy as _

from pycountry import countries

__all__ = [
    'Customer',
    'Address',
]

"""
https://help.shopify.com/api/reference/customer
"""

class Customer(models.Model):

    STATES = (
        ('disabled', 'disabled'),
        ('decline', 'decline'),
        ('invited', 'invited'),
    )

    accepts_marketing = models.BooleanField(_('Sent marketing material via email'), default=False)
    #addresses
    created_at = models.DateTimeField(_('When the customer was created'), default=timezone.now)
    default_address = models.OneToOneField('Address', related_name='+', null=True)
    email = models.EmailField(_('email address'), max_length=254, blank=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    #metafield
    #multipass_identifier
    note = models.TextField(_('A note about the customer'), blank=True, max_length=254)
    state = models.CharField(max_length=20, choices=STATES, default = 'disabled')
    tags = models.CharField(_('A note about the customer'), blank=True, max_length=254)
    tax_exempt = models.BooleanField(default=True)
    #total_spent
    updated_at = models.DateTimeField(_('Information was updated'), default=timezone.now)
    verified_email = models.BooleanField(default=True)
    

class Address(models.Model):
    
    #These countries are not in pycountry
    EXTRA_COUNTRY_CHOICES = [
        ('XK', _('Kosovo')),
    ]
    COUNTRY_CHOICES = [(c.alpha2, getattr(c, 'common_name', c.name))
                       for c in countries]
    COUNTRY_CHOICES += EXTRA_COUNTRY_CHOICES

    customer = models.ForeignKey(Customer, related_name='addresses')
    address1 = models.CharField(_("The  mailing address"), blank=True, max_length=254)
    address2 = models.CharField(_("An additional field for the mailing address"), blank=True, max_length=254)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    phone = models.CharField(_('Phone (optional)'), max_length=30, blank=True)
    city = models.CharField(_("The city"), blank=True, null=True, max_length=54)
    company = models.CharField(_("The company"), blank=True, max_length=254)
    #country
    country_code = models.CharField(max_length=2, choices=COUNTRY_CHOICES, null=True)
    #country_name
    #defaul
    province = models.CharField(_( "The province or state name"), blank=True, max_length=254)
    province_code = models.CharField(_( "The two-letter code for the province or state"), blank=True, max_length=2)
    zip = models.CharField(_( "The zip or postal code"), blank=True, max_length=20)
    
    @property
    def default(self):
        return self.customer.default_address_id == self.id
        