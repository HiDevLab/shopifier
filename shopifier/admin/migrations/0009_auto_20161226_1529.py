# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-12-26 09:29
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shopifier_admin', '0008_auto_20161226_1502'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='productimage',
            options={'ordering': ['product', 'position']},
        ),
        migrations.AlterModelOptions(
            name='productvariant',
            options={'ordering': ['product', 'position']},
        ),
    ]
