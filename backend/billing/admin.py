from django.contrib import admin
from .models import PaymentTransaction, Subscription, SubscriptionPlan
admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)
admin.site.register(PaymentTransaction)
