from __future__ import unicode_literals

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sessions.models import Session
from django.core.signing import Signer
from django.core.mail import send_mail
from django.http.response import Http404
from django.views.generic.base import TemplateView
from django.views.decorators.cache import cache_page
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template, render_to_string
from django.utils.translation import ugettext_lazy as _

from rest_framework import permissions, mixins
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.viewsets import GenericViewSet

from account.serializers import *
from account.models import User, UserLog


class AdminTemplateView(TemplateView):
    '''
    Render admin app template
    '''
    cache_timeout = 0
    template_engine = 'default'

    def get_template_names(self):
        template_name = 'admin/{}'.format(self.kwargs['template_name'])
        try:
            get_template(template_name)
        except TemplateDoesNotExist:
            raise Http404
        return [template_name]

    def dispatch(self, request, *args, **kwargs):
        s = super(AdminTemplateView, self).dispatch
        return cache_page(self.cache_timeout)(s)(request, *args, **kwargs)


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(**serializer.validated_data)

        if user:
            login(request, user)
            return Response(
                {'success': _('User logged in')}, status=status.HTTP_200_OK
            )
        else:
            content = {'detail': _('Your email or password was incorrect')}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)


class PasswordChangeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PasswordChangeSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.data['old_password']):
            content = {'status': _('Current password is wrong')}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.data['password'])
        request.user.save(update_fields=('password',))
        return Response(
            {"success": _("New password has been saved.")},
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        logout(request)
        content = {'success': _('User logged out.')}
        return Response(content, status=status.HTTP_200_OK)


def get_token(email):
    signer = Signer()
    return signer.signature(email)


class UserInviteView(CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserInviteSerializer

    email_html_template_name = 'admin/emails/invite_email.html'
    email_text_template_name = 'admin/emails/invite_email.txt'

    def perform_create(self, serializer):
        user = serializer.save()
        current_user = self.request.user
        ref_url = '{}/auth/accept/{}/{}/'.format(
            settings.SITE, user.id, get_token(user.email)
        )
        store_name = settings.STORE_NAME

        context = {
            'user': '{} {}'.format(user.first_name, user.last_name),
            'current_user': '{} {}'.format(
                current_user.first_name, current_user.last_name
            ),
            'reference': ref_url,
            'store_name': store_name,
            'store_ref': settings.SITE
        }

        send_mail(
            subject='Welcome to Shopifier',
            message=render_to_string(self.email_text_template_name, context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=render_to_string(
                self.email_html_template_name, context
            ),
        )

        user.is_active = False
        user.is_admin = False
        user.save()
        return user


class UserDeclineInviteView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserCheckTokenSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['pk']
        if get_token(user.email) != serializer.validated_data['token']:
            return Response(
                {'details': _('Wrong Token')},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.delete()
        content = {'success': 'Invitation declined.'}
        return Response(content, status=status.HTTP_200_OK)


class UserActivateView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserActivateSerializer

    def post(self, request, format=None):

        serializer = UsersAdminSerializer2(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['id']

        if get_token(user.email) != serializer.validated_data['token']:
            return Response(
                {'details': _('Wrong Token')},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['password1'])
        user.is_active = True
        user.is_staff = True
        user.save()
        user = authenticate(**serializer.validated_data)
        if user:
            login(request, user)
        return Response(
            {'success': _('User logged in')}, status=status.HTTP_200_OK
        )


class CurrentUserView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        if request.user.is_anonymous():
            content = {'detail': 'user is anonymous'}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)

        else:
            serializer = UserSerializer(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)


class UserCheckToken1View(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserCheckTokenSerializer

    def post(self, request, format=None):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['pk']

        if get_token(user.email) != serializer.validated_data['token']:
            return Response(
                {'details':
                    _('The link to reset your password is no longer valid.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserCheckToken2View(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserCheckTokenSerializer
    token_generator = default_token_generator

    def post(self, request, format=None):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['pk']

        if (self.token_generator.make_token(user) !=
                serializer.validated_data['token']):
            return Response(
                {'details':
                    _('The link to reset your password is no longer valid.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserPasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetSerializer
    token_generator = default_token_generator

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['pk']
        if (self.token_generator.make_token(user) !=
                serializer.validated_data['token']):
            return Response(
                {'details': 'Wrong Token'}, status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=('password',))

        user = authenticate(**serializer.validated_data)
        if user:
            login(request, user)
        return Response(
            {'success': _("New password has been saved.")},
            status=status.HTTP_200_OK
        )


class UserPasswordRecoverView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailSerializer

    subject_template_name = 'admin/emails/password_reset_subject.txt'
    email_template_name = 'admin/emails/password_reset_body.html'
    txt_template_name = 'admin/emails/password_reset_body.txt'

    token_generator = default_token_generator

    def send_email(self, user):
        context = {
            'user': '{} {}'.format(user.first_name, user.last_name),
            'reference': '{}/admin/auth/reset/{}/{}'.format(
                settings.SITE, user.id, self.token_generator.make_token(user)),
            'store_name': settings.STORE_NAME,
            'store_ref': settings.SITE
        }

        subject = render_to_string(self.subject_template_name, context)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())
        send_mail(
            subject=subject,
            message=render_to_string(self.txt_template_name, context),
            from_email=DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=render_to_string(self.email_template_name, context),
        )

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            content = {
                'detail':
                    _("Couldn't find an account for {}".format(email))}
            return Response(content, status=status.HTTP_401_UNAUTHORIZED)
        else:
            self.send_email(user)

        return Response({}, status=status.HTTP_200_OK)


class UsersAdminViewSet(ModelViewSet):
    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('id')
    serializer_class = UsersAdminSerializer

    @detail_route(methods=['get'])
    def session(self, request, pk=None):
        user = self.get_object()
        log = UserLog.objects.filter(
            user=user, visit_datetime__isnull=False
        )[0:5]
        serializer = SessionsSerializer(log, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @detail_route(methods=['delete'])
    def deletesession(self, request, pk=None):
        user = self.get_object()
        [s.delete() for s in Session.objects.all()
            if int(s.get_decoded().get('_auth_user_id')) == user.id]
        content = {'success': 'Sessions Expired.'}
        return Response(content, status=status.HTTP_200_OK)

    def update(self, request, format=None, *args, **kwargs):

        serializer = UsersAdminSerializer2(data=request.data)
        serializer.is_valid(raise_exception=True)

        if 'admin_password' in serializer.data:
            if not request.user.check_password(
                        serializer.data['admin_password']):
                content = {'admin_password':
                           _('Current password did not match records')}
                return Response(content, status=status.HTTP_400_BAD_REQUEST)

        if 'password1' in serializer.data:
            user = self.get_object()
            user.set_password(serializer.data['password1'])
            user.save(update_fields=('password',))

        return super(UsersAdminViewSet, self).update(request, *args, **kwargs)


class UsersStaffViewSet(mixins.RetrieveModelMixin,
                        mixins.UpdateModelMixin, GenericViewSet):

    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UsersStaffSerializer

    def check_object_permissions(self, request, obj):
        if obj.id != request.user.id:
            raise PermissionDenied
        else:
            super(UsersStaffViewSet, self).check_object_permissions(
                request, obj
            )


class SessionsExpire(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def delete(self, request, format=None):
        user = request.user
        [s.delete() for s in Session.objects.all()
            if int(s.get_decoded().get('_auth_user_id')) != user.id]

        content = {'success': 'Sessions Expired.'}
        return Response(content, status=status.HTTP_200_OK)
