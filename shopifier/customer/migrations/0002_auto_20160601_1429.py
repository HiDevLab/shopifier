# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-06-01 08:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='default_address',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='+', to='customer.Address'),
        ),
    ]