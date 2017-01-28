# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-01-23 05:30
from __future__ import unicode_literals

from django.db import migrations, models
import shopifier.admin.tags


class Migration(migrations.Migration):

    dependencies = [
        ('shopifier_admin', '0012_userlog_user_agent'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='created_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='handle',
            field=models.CharField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='product',
            name='metafields_global_description_tag',
            field=models.TextField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='product',
            name='metafields_global_title_tag',
            field=models.TextField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='product',
            name='product_type',
            field=models.CharField(blank=True, max_length=254, verbose_name='Product type'),
        ),
        migrations.AddField(
            model_name='product',
            name='published_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='published_scope',
            field=models.CharField(blank=True, default='global', max_length=254, verbose_name='The sales channels in which the product is visible'),
        ),
        migrations.AddField(
            model_name='product',
            name='tags',
            field=shopifier.admin.tags.TagField(base_field=models.CharField(max_length=50), blank=True, default=[], size=None),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='product',
            name='template_suffix',
            field=models.CharField(blank=True, max_length=254, verbose_name='The suffix of the liquid template being used'),
        ),
        migrations.AddField(
            model_name='product',
            name='updated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='vendor',
            field=models.TextField(blank=True, max_length=254, verbose_name='Vendor'),
        ),
    ]