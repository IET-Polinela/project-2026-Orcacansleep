from django.http import JsonResponse
from django.db.models import Q
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    UpdateView,
    DeleteView,
    View,
    TemplateView,
)
from django.shortcuts import get_object_or_404, redirect

from .models import Report
from .forms import ReportForm


class LoginRequiredMessageMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Silakan login terlebih dahulu.')
            return redirect('login')

        return super().dispatch(request, *args, **kwargs)


class CitizenOnlyMixin(LoginRequiredMessageMixin):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_admin:
            messages.error(request, 'Admin tidak diizinkan menggunakan fitur ini.')
            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


class OwnerDraftOnlyMixin(LoginRequiredMessageMixin):
    def dispatch(self, request, *args, **kwargs):
        report = self.get_object()

        if request.user.is_admin:
            messages.error(request, 'Admin tidak diizinkan mengedit atau menghapus laporan.')
            return redirect('report_list')

        if report.reporter != request.user:
            messages.error(request, 'Kamu hanya dapat mengelola laporan milik sendiri.')
            return redirect('report_list')

        if report.status != 'DRAFT':
            messages.error(request, 'Laporan yang sudah diajukan tidak dapat diubah.')
            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


class AdminStatusOnlyMixin(LoginRequiredMessageMixin):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_admin:
            messages.error(request, 'Akses ditolak. Fitur ini hanya untuk admin.')
            return redirect('report_list')

        return super().dispatch(request, *args, **kwargs)


class HomeView(TemplateView):
    template_name = 'main_app/landing.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['total_reports'] = Report.objects.count()
        context['reported_reports'] = Report.objects.filter(status='REPORTED').count()
        context['verified_reports'] = Report.objects.filter(status='VERIFIED').count()
        context['in_progress_reports'] = Report.objects.filter(status='IN_PROGRESS').count()
        context['resolved_reports'] = Report.objects.filter(status='RESOLVED').count()

        return context


class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'

    def get_queryset(self):
        user = self.request.user

        queryset = Report.objects.all().order_by('-updated_at')

        if user.is_authenticated and user.is_admin:
            return queryset.exclude(status='DRAFT')

        if user.is_authenticated:
            return queryset.filter(
                Q(reporter=user) |
                ~Q(status='DRAFT')
            )

        return queryset.exclude(status='DRAFT')


class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'

    def get_queryset(self):
        user = self.request.user

        queryset = Report.objects.all()

        if user.is_authenticated and user.is_admin:
            return queryset.exclude(status='DRAFT')

        if user.is_authenticated:
            return queryset.filter(
                Q(reporter=user) |
                ~Q(status='DRAFT')
            )

        return queryset.exclude(status='DRAFT')


class ReportCreateView(CitizenOnlyMixin, CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        form.instance.reporter = self.request.user
        form.instance.status = 'DRAFT'
        messages.success(self.request, 'Draft laporan berhasil ditambahkan.')
        return super().form_valid(form)


class ReportUpdateView(OwnerDraftOnlyMixin, UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/edit_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Draft laporan berhasil diperbarui.')
        return super().form_valid(form)


class ReportDeleteView(OwnerDraftOnlyMixin, DeleteView):
    model = Report
    template_name = 'main_app/report_confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Draft laporan berhasil dihapus.')
        return super().form_valid(form)


class ReportUpdateStatusView(AdminStatusOnlyMixin, View):
    allowed_transitions = {
        'REPORTED': 'VERIFIED',
        'VERIFIED': 'IN_PROGRESS',
        'IN_PROGRESS': 'RESOLVED',
    }

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        if report.status == 'DRAFT':
            messages.error(request, 'Admin tidak dapat mengubah laporan berstatus DRAFT.')
            return redirect('report_list')

        expected_status = self.allowed_transitions.get(report.status)

        if expected_status == new_status:
            report.status = new_status
            report.save()
            messages.success(request, f'Status laporan berhasil diubah menjadi {new_status}.')
        else:
            messages.error(request, 'Perubahan status tidak valid.')

        return redirect('report_list')


class ReportSearchView(View):
    def get(self, request, *args, **kwargs):
        keyword = request.GET.get('q', '').strip()
        user = request.user

        reports = Report.objects.all().order_by('-updated_at')

        if user.is_authenticated and user.is_admin:
            reports = reports.exclude(status='DRAFT')
        elif user.is_authenticated:
            reports = reports.filter(
                Q(reporter=user) |
                ~Q(status='DRAFT')
            )
        else:
            reports = reports.exclude(status='DRAFT')

        if keyword:
            reports = reports.filter(
                Q(title__icontains=keyword) |
                Q(category__icontains=keyword) |
                Q(location__icontains=keyword) |
                Q(status__icontains=keyword)
            )

        data = []

        for report in reports:
            is_owner = user.is_authenticated and report.reporter == user
            is_admin = user.is_authenticated and user.is_admin
            is_citizen = user.is_authenticated and user.is_member and not user.is_admin

            data.append({
                'id': report.id,
                'title': report.title,
                'category': report.category,
                'description': report.description,
                'location': report.location,
                'status': report.status,
                'created_at': report.created_at.strftime('%d-%m-%Y %H:%M'),
                'is_admin': is_admin,
                'can_edit': is_citizen and is_owner and report.status == 'DRAFT',
                'can_delete': is_citizen and is_owner and report.status == 'DRAFT',
                'can_update_status': is_admin and report.status in ['REPORTED', 'VERIFIED', 'IN_PROGRESS'],
            })

        return JsonResponse({'reports': data})


class ReportDetailAjaxView(View):
    def get(self, request, pk, *args, **kwargs):
        report = get_object_or_404(Report, pk=pk)

        data = {
            'id': report.id,
            'title': report.title,
            'category': report.category,
            'description': report.description,
            'location': report.location,
            'status': report.status,
            'created_at': report.created_at.strftime('%d-%m-%Y %H:%M'),
        }

        return JsonResponse(data)