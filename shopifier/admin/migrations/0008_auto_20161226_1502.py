# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-12-26 09:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shopifier_admin', '0007_auto_20161226_1501'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productvariant',
            name='option3',
            field=models.CharField(blank=True, max_length=254, null=True),
        ),
    ]
