# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-01-28 09:36
from __future__ import unicode_literals

from django.db import migrations, models
import shopifier.admin.models
import shopifier.admin.tags


class Migration(migrations.Migration):

    dependencies = [
        ('shopifier_admin', '0013_auto_20170123_1130'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomCollection',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('body_html', models.TextField(max_length=2048, verbose_name='Description')),
                ('handle', models.CharField(blank=True, max_length=254)),
                ('image', models.ImageField(upload_to=shopifier.admin.models.normalization_img_collection_file_name)),
                ('published', models.BooleanField(default=True)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('published_scope', models.CharField(blank=True, default='global', max_length=254, verbose_name='The sales channels in which the custom collection is visible')),
                ('sort_order', models.CharField(choices=[('alpha-asc', 'Alphabetically, in ascending order (A - Z)'), ('alpha-desc', 'Alphabetically, in descending order (Z - A)'), ('best-selling', 'By best-selling products'), ('created', 'By date created, in ascending order (oldest - newest)'), ('created-desc', 'By date created, in descending order (newest - oldest)'), ('manual', 'Order created by the shop owner'), ('price-asc', 'By price, in ascending order (lowest - highest)'), ('price-desc', 'By price, in descending order (highest - lowest)')], default='alpha-asc', max_length=56)),
                ('template_suffix', models.CharField(blank=True, max_length=254, verbose_name='The suffix of the liquid template being used')),
                ('updated_at', models.DateTimeField(default=shopifier.admin.models.now)),
            ],
        ),
        migrations.AlterField(
            model_name='product',
            name='tags',
            field=shopifier.admin.tags.TagField(base_field=models.CharField(max_length=50), blank=True, default=[], size=None),
        ),
    ]