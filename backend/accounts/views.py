from django.conf import settings
from django.contrib.auth import logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import User
from .permissions import IsSelfOrSupportReadOnly
from .serializers import (
    ArtistRegisterSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    RegisterSerializer,
    UserPreferenceSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user, context={'request': request, 'include_private': True}).data}, status=status.HTTP_201_CREATED)


class ArtistRegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = ArtistRegisterSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user, context={'request': request, 'include_private': True}).data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.create_token_payload())


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def delete(self, request):
        Token.objects.filter(user=request.user).delete()
        request.user.delete()
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserPreferenceSerializer(request.user.preferences).data)

    def patch(self, request):
        serializer = UserPreferenceSerializer(request.user.preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject='Melora password reset',
                message=f'Use this password reset link: {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        return Response({'message': 'If that account exists, a reset email has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data['token']):
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])
        Token.objects.filter(user=user).delete()
        return Response({'message': 'Password updated successfully.'})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSelfOrSupportReadOnly]

    def get_permissions(self):
        if self.action in {'follow', 'unfollow'}:
            return [IsAuthenticated()]
        return super().get_permissions()
    search_fields = ['display_name', 'username']
    ordering_fields = ['display_name', 'date_joined']

    def get_queryset(self):
        qs = User.objects.filter(is_active=True).prefetch_related('following', 'followers')
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role.upper())
        return qs

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        already_following = request.user.following.filter(pk=target.pk).exists()
        request.user.following.add(target)
        if not already_following:
            from community.models import Notification
            Notification.objects.create(
                user=target,
                type=Notification.Type.FOLLOW,
                message=f'{request.user.display_name} started following you.',
                link=f'/users/{request.user.pk}',
            )
        return Response({'following': True, 'targetId': str(target.pk)})

    @action(detail=True, methods=['delete'])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        request.user.following.remove(target)
        return Response(status=status.HTTP_204_NO_CONTENT)
