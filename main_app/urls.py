from django.urls import path
from .views import (
    HomeView,
    ReportListView,
    ReportDetailView,
    ReportCreateView,
    ReportUpdateView,
    ReportDeleteView,
    ReportUpdateStatusView,
    ReportSearchView,
    ReportDetailAjaxView,
)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('reports/', ReportListView.as_view(), name='report_list'),
    path('report/<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('add/', ReportCreateView.as_view(), name='report_add'),
    path('edit/<int:pk>/', ReportUpdateView.as_view(), name='report_edit'),
    path('delete/<int:pk>/', ReportDeleteView.as_view(), name='report_delete'),
    path('update-status/<int:pk>/', ReportUpdateStatusView.as_view(), name='report_update_status'),
    path('api/search/', ReportSearchView.as_view(), name='report_search'),
    path('api/report/<int:pk>/', ReportDetailAjaxView.as_view(), name='report_detail_ajax'),
]