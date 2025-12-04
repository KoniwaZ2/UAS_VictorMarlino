"""
URL Configuration for API endpoints
"""

from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('flights/search/', views.search_flights, name='search_flights'),
    path('locations/search/', views.search_locations, name='search_locations'),
    path('flights/confirm-price/', views.confirm_flight_price, name='confirm_flight_price'),
]
