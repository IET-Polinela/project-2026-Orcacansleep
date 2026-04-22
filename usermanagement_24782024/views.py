from django.contrib import messages
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import CreateView

from .forms import CustomAuthenticationForm, CustomUserCreationForm

class CustomLoginView(LoginView):
    template_name = 'usermanagement_24782024/login.html'
    authentication_form = CustomAuthenticationForm
    redirect_authenticated_user = True

    def form_valid(self, form):
        messages.success(self.request, 'Login berhasil.')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('report_list')

class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        messages.success(request, 'Logout berhasil.')
        return super().dispatch(request, *args, **kwargs)

class RegisterView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'usermanagement_24782024/register.html'
    success_url = reverse_lazy('login')

    def form_valid(self, form):
        user = form.save(commit=False)
        user.is_admin = False
        user.is_member = True
        user.save()
        messages.success(self.request, 'Registrasi berhasil. Silakan login.')
        return redirect('login')