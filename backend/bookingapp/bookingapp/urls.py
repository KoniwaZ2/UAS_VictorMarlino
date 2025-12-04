"""
URL configuration for bookingapp project.
"""
from django.urls import path, include

urlpatterns = [
    path('api/', include('api.urls')),
]
