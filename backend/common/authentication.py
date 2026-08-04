from rest_framework.authentication import SessionAuthentication, TokenAuthentication


class SubscriptionAwareMixin:
    def authenticate(self, request):
        result = super().authenticate(request)
        if result:
            user, auth = result
            from billing.services import sync_user_subscription
            sync_user_subscription(user)
            return user, auth
        return result


class SubscriptionAwareTokenAuthentication(SubscriptionAwareMixin, TokenAuthentication):
    pass


class SubscriptionAwareSessionAuthentication(SubscriptionAwareMixin, SessionAuthentication):
    pass
