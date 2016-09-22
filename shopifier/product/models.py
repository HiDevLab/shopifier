from __future__ import unicode_literals

from django.db import models
from django.utils.translation import ugettext_lazy as _


class Product(models.Model):

    body_html = models.TextField(
        _('Description'), blank=False, max_length=2048)
    title = models.TextField(_('Title'), blank=False, max_length=254)
