# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-11-04 08:48
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import shopifier.admin.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sessions', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('first_name', models.CharField(max_length=30, verbose_name='first name')),
                ('last_name', models.CharField(max_length=30, verbose_name='last name')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('phone', models.CharField(blank=True, max_length=30, verbose_name='Phone (optional)')),
                ('www_site', models.CharField(blank=True, max_length=30, verbose_name='Personal website address (optional)')),
                ('bio', models.TextField(blank=True, max_length=2048, verbose_name='Bio (optional)')),
                ('avatar_image', models.ImageField(blank=True, upload_to=shopifier.admin.models.normalization_file_name, verbose_name='Portfile photo')),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False, verbose_name='staff status')),
                ('is_admin', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
            },
        ),
        migrations.CreateModel(
            name='UserLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip', models.GenericIPAddressField(null=True)),
                ('visit_datetime', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('session', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='sessions.Session')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-visit_datetime', 'id'],
            },
        ),
    ]
