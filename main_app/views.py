from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, View, TemplateView
from django.shortcuts import get_object_or_404, redirect
from .models import Report
from .forms import ReportForm

class HomeView(TemplateView):
    template_name = 'main_app/landing.html'

class ReportListView(ListView):
    model = Report
    template_name = 'main_app/home.html'
    context_object_name = 'reports'

class ReportDetailView(DetailView):
    model = Report
    template_name = 'main_app/report_detail.html'
    context_object_name = 'report'

class ReportCreateView(CreateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/add_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil ditambahkan.')
        return super().form_valid(form)

class ReportUpdateView(UpdateView):
    model = Report
    form_class = ReportForm
    template_name = 'main_app/edit_report.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil diperbarui.')
        return super().form_valid(form)

class ReportDeleteView(DeleteView):
    model = Report
    template_name = 'main_app/report_confirm_delete.html'
    success_url = reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, 'Laporan berhasil dihapus.')
        return super().form_valid(form)

class ReportUpdateStatusView(View):
    allowed_transitions = {
        'REPORTED': 'VERIFIED',
        'VERIFIED': 'IN_PROGRESS',
        'IN_PROGRESS': 'RESOLVED',
    }

    def post(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.POST.get('status')

        if self.allowed_transitions.get(report.status) == new_status:
            report.status = new_status
            report.save()
            messages.success(request, f'Status laporan berhasil diubah menjadi {new_status}.')
        else:
            messages.error(request, 'Perubahan status tidak valid.')

        return redirect('report_list')