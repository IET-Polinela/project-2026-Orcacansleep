from django.db.models import Count
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from main_app.models import Report


class DashboardView(TemplateView):
    template_name = 'dashboard_24782024/index.html'


class DashboardStatsView(View):
    def get(self, request, *args, **kwargs):
        status_qs = Report.objects.values('status').annotate(total=Count('id')).order_by('status')
        category_qs = Report.objects.values('category').annotate(total=Count('id')).order_by('category')

        latest_reported_qs = Report.objects.filter(status='REPORTED').order_by('-created_at')[:5]
        latest_resolved_qs = Report.objects.filter(status='RESOLVED').order_by('-created_at')[:5]

        status_labels = [item['status'] for item in status_qs]
        status_values = [item['total'] for item in status_qs]

        category_labels = [item['category'] for item in category_qs]
        category_values = [item['total'] for item in category_qs]

        latest_reported = [
            {
                'title': report.title,
                'category': report.category,
                'location': report.location,
                'status': report.status,
                'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
            }
            for report in latest_reported_qs
        ]

        latest_resolved = [
            {
                'title': report.title,
                'category': report.category,
                'location': report.location,
                'status': report.status,
                'created_at': report.created_at.strftime('%d-%m-%Y %H:%M')
            }
            for report in latest_resolved_qs
        ]

        data = {
            'status_labels': status_labels,
            'status_values': status_values,
            'category_labels': category_labels,
            'category_values': category_values,
            'latest_reported': latest_reported,
            'latest_resolved': latest_resolved,
        }

        return JsonResponse(data)