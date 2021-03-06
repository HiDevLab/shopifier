# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-01-10 12:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shopifier_admin', '0009_auto_20161226_1529'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='receive_announcements',
            field=models.BooleanField(default=False, verbose_name='Allow important notifications to be sent by email'),
        ),
    ]
