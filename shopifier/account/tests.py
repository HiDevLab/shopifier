from django.test import TestCase, Client
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.core.signing import Signer
from django.core.exceptions import ValidationError
from django import forms 
from django.core.urlresolvers import reverse
import datetime
from django.template.loader import render_to_string
from django.contrib.sessions.models import Session
from django.template.loader import render_to_string
from django.core import management
from django.utils.six import StringIO

from .models  import *

class CUserModelTests(TestCase):
    
    def test_create_super_user(self):
        user = create_superuser("ainf23@mail.ru", "Coxb2014") 
        
        self.assertEqual(user.email, "ainf23@mail.ru")
        self.assertEqual(check_password("Coxb2014", user.password), True )
        self.assertNotEqual(check_password("Coxb2015", user.password), True )
        self.assertEqual(user.is_active, True)
        self.assertEqual(user.is_admin, True)
        self.assertEqual(user.is_staff, True)
        self.assertEqual(user.__unicode__(), "ainf23@mail.ru")
        self.assertEqual(user.has_perm(None), True)
        self.assertEqual(user.has_module_perms(None), True)
        self.assertEqual(user.username, "ainf23@mail.ru")       
        
