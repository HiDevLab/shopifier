import json

from django.conf import settings
from django.core.urlresolvers import reverse
from django.test.client import Client, MULTIPART_CONTENT
from django.utils.encoding import force_text


from rest_framework import status


class APIClient(Client):

    def patch(self, path, data='', content_type=MULTIPART_CONTENT,
              follow=False, **extra):
        return self.generic('PATCH', path, data, content_type, **extra)

    def options(self, path, data='', content_type=MULTIPART_CONTENT,
                follow=False, **extra):
        return self.generic('OPTIONS', path, data, content_type, **extra)


class BaseAccountTest(object):

    def send_request(self, request_method, *args, **kwargs):
        request_func = getattr(self.client, request_method)
        status_code = None
        if 'content_type' not in kwargs and request_method != 'get':
            kwargs['content_type'] = 'application/json'

        if ('data' in kwargs and request_method != 'get' and
                kwargs['content_type'] == 'application/json'):
            data = kwargs.get('data', '')
            kwargs['data'] = json.dumps(data)

        if 'status_code' in kwargs:
            status_code = kwargs.pop('status_code')

        self.response = request_func(*args, **kwargs)
        is_json = bool(
            [x for x in self.response._headers['content-type'] if 'json' in x])
        if is_json and self.response.content:
            self.response.json = json.loads(force_text(self.response.content))
        else:
            self.response.json = {}
        if status_code:
            self.assertEqual(self.response.status_code, status_code)
        return self.response

    def post(self, *args, **kwargs):
        return self.send_request('post', *args, **kwargs)

    def get(self, *args, **kwargs):
        return self.send_request('get', *args, **kwargs)

    def patch(self, *args, **kwargs):
        return self.send_request('patch', *args, **kwargs)

    def put(self, *args, **kwargs):
        return self.send_request('put', *args, **kwargs)

    def delete(self, *args, **kwargs):
        return self.send_request('delete', *args, **kwargs)

    def init(self):
        settings.DEBUG = True
        self.client = APIClient()

        self.login_url = reverse('api_login')
        self.logout_url = reverse('api_logout')
        self.password_change_url = reverse('api_password_change')
        self.invaite_url = reverse('api_invaite')
        self.confirm_url = reverse('api_confirm')
        self.activate_url = reverse('api_activate')

    def _login_adm(self):
        fill = {
            "email": self.ADMIN_EMAIL,
            "password": self.ADMIN_PASS
        }
        self.post(self.login_url, data=fill, status_code=status.HTTP_200_OK)
