from django.test import TestCase
from django.core import mail
from django.core.signing import Signer
from django.contrib.auth.hashers import check_password
from django.utils.translation import ugettext_lazy as _

from rest_framework.status import (
        HTTP_200_OK,
        HTTP_400_BAD_REQUEST,
        HTTP_403_FORBIDDEN,
        HTTP_401_UNAUTHORIZED
    )

from shopifier_admin.base_test import BaseAccountTest
from shopifier_admin.models import User


class ModelAccountTests(TestCase):

    ADMIN_EMAIL = 'a@y.ru'
    ADMIN_PASS = 'Rfvtymwtkeqenhjv'
    EMAIL = 'ainf23@rambler.ru'

    def test_create_super_user(self):
        # no email
        with self.assertRaisesRegexp(
            ValueError, 'The given email must be set'
        ):
            User.objects.create_superuser('', self.ADMIN_PASS)

        # create super user
        user = User.objects.create_superuser(self.ADMIN_EMAIL, self.ADMIN_PASS)
        self.assertEqual(check_password(self.ADMIN_PASS, user.password), True)
        self.assertEqual(user.is_active, True)
        self.assertEqual(user.is_admin, True)
        self.assertEqual(user.is_staff, True)

    def test_create_ser(self):
        # no email
        with self.assertRaisesRegexp(
            ValueError, 'The given email must be set'
        ):
            User.objects.create_user('')

        # create user
        user = User.objects.create_user(self.EMAIL)
        self.assertEqual(user.is_active, False)
        self.assertEqual(user.is_admin, False)
        self.assertEqual(user.is_staff, False)


class AccountTests(TestCase, BaseAccountTest):

    ADMIN_EMAIL = 'a@y.ru'
    ADMIN_PASS = 'Rfvtymwtkeqenhjv'
    EMAIL = 'ainf23@rambler.ru'
    PASS = 'Rfvtymwtkeqenhjv'
    FIRST_NAME = 'Ivan'
    LAST_NAME = 'Ivanov'
    NEW_PASS = 'Rfvtymwtkeqenhjv1'
    WRONG_PASS = 'Rfvtymwtkeqenhj'

    def setUp(self):
        self.init()

    def test_base_account_methods(self):

        # no user else (401)
        fill = {
            'email': self.EMAIL,
            'password': self.PASS
        }
        # no user else (401)
        self.post(self.login_url, data=fill, status_code=HTTP_401_UNAUTHORIZED)

        # invaite user
        fill = {
            'first_name': self.FIRST_NAME,
            'last_name': self.LAST_NAME,
            'email': self.EMAIL,
        }

        # anonymous invaiting
        self.post(self.invaite_url, data=fill, status_code=HTTP_403_FORBIDDEN)

        # admin invation
        User.objects.create_superuser(self.ADMIN_EMAIL, self.ADMIN_PASS)
        self._login_adm()

        mail_count = len(mail.outbox)
        self.post(self.invaite_url, data=fill, status_code=201)
        self.assertEqual(len(mail.outbox), mail_count + 1)

        # user properties
        user = User.objects.get(email=self.EMAIL)
        self.assertEqual(user.is_active, False)
        self.assertEqual(user.is_admin, False)
        self.assertEqual(user.is_staff, False)
        self.assertEqual(
            user.get_full_name(),
            '{} {}'.format(self.FIRST_NAME, self.LAST_NAME)
        )
        self.assertEqual(user.get_short_name(), self.FIRST_NAME)
        self.assertEqual(user.__unicode__(), self.EMAIL)
        self.assertEqual(user.has_perm(None), True)
        self.assertEqual(user.has_module_perms(None), True)
        self.assertEqual(user.username, self.EMAIL)

        # confim user
        signer = Signer()
        sign = signer.signature(self.EMAIL)

        fill = {
            'pk': user.id,
            'token': sign
        }
        response = self.get(
            self.confirm_url, data=fill, status_code=HTTP_200_OK
        )

        # confim wrong user.id
        fill = {
            'pk': user.id+10,
            'token': sign
        }
        self.get(self.confirm_url, data=fill, status_code=HTTP_400_BAD_REQUEST)

        # confim wrong token
        fill = {
            'pk': user.id,
            'token': sign+'1'
        }
        self.get(self.confirm_url, data=fill, status_code=HTTP_400_BAD_REQUEST)

        # activates user
        fill = {
            'pk': user.id,
            'token': sign,
            'first_name': self.FIRST_NAME,
            'last_name': self.LAST_NAME,
            'email': self.EMAIL,
            'password': self.PASS,
            'phone': '+7800800800'
        }

        # activate wrong user.id
        fill['pk'] = user.id + 10

        self.post(
            self.activate_url, data=fill, status_code=HTTP_400_BAD_REQUEST
        )

        # activate wrong token
        fill['pk'] = user.id
        fill['token'] = sign+'1'
        self.post(
            self.activate_url, data=fill, status_code=HTTP_400_BAD_REQUEST
        )

        # activate  and login user
        fill['token'] = sign
        response = self.post(
            self.activate_url, data=fill, status_code=HTTP_200_OK
        )
        self.assertEqual(response.json['success'], _('User logged in'))

        # password change wrong old password
        fill = {
            'password': self.NEW_PASS,
            'old_password': self.WRONG_PASS
        }

        response = self.post(
            self.password_change_url, data=fill,
            status_code=HTTP_400_BAD_REQUEST
        )
        self.assertEqual(
            response.json['status'], _('Current password is wrong')
        )

        # password change
        fill = {
            'password': self.NEW_PASS,
            'old_password': self.PASS
        }
        self.post(self.password_change_url, data=fill, status_code=HTTP_200_OK)

        # login wrong password
        fill = {
            'email': self.EMAIL,
            'password': self.WRONG_PASS
        }
        self.post(self.login_url, data=fill, status_code=401)

        # login success
        fill = {
            'email': self.EMAIL,
            'password': self.NEW_PASS
        }
        self.post(self.login_url, data=fill, status_code=HTTP_200_OK)

        # logout
        self.get(self.logout_url, status_code=HTTP_200_OK)
