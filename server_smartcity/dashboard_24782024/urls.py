from django.urls import path
from .views import DashboardView, DashboardStatsView

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('api/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]