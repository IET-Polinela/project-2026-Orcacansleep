from rest_framework import viewsets, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q

from .models import Report
from .serializers import ReportSerializer
from .permissions import ReportRolePermission


class ReportPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    pagination_class = ReportPagination
    permission_classes = [permissions.IsAuthenticated, ReportRolePermission]

    admin_status_transitions = {
        'REPORTED': 'VERIFIED',
        'VERIFIED': 'IN_PROGRESS',
        'IN_PROGRESS': 'RESOLVED',
    }

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        user = self.request.user
        tab = self.request.query_params.get('tab')

        queryset = Report.objects.all().order_by('-updated_at')

        # Admin hanya melihat laporan yang sudah diajukan warga
        if user.is_admin:
            return queryset.exclude(status='DRAFT')

        # Citizen melihat laporan miliknya sendiri
        if tab == 'my_reports':
            return queryset.filter(reporter=user)

        # Citizen melihat feed kota: laporan orang lain yang bukan draft
        if tab == 'feed':
            return queryset.filter(
                ~Q(reporter=user),
                ~Q(status='DRAFT')
            )

        # Default citizen: laporan milik sendiri + laporan publik
        return queryset.filter(
            Q(reporter=user) |
            ~Q(status='DRAFT')
        )

    def perform_create(self, serializer):
        requested_status = self.request.data.get('status', 'DRAFT')

        if requested_status not in ['DRAFT', 'REPORTED']:
            requested_status = 'DRAFT'

        serializer.save(
            reporter=self.request.user,
            status=requested_status
        )

    def update(self, request, *args, **kwargs):
        if request.user.is_admin:
            return Response(
                {'detail': 'Admin tidak diizinkan mengedit isi laporan.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        report = self.get_object()

        # Admin hanya boleh mengubah status laporan non-DRAFT
        if request.user.is_admin:
            new_status = request.data.get('status')
            expected_status = self.admin_status_transitions.get(report.status)

            if report.status == 'DRAFT':
                return Response(
                    {'detail': 'Admin tidak dapat mengubah laporan berstatus DRAFT.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if set(request.data.keys()) != {'status'}:
                return Response(
                    {'detail': 'Admin hanya boleh mengubah status laporan.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if new_status != expected_status:
                return Response(
                    {'detail': 'Perubahan status tidak valid.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            report.status = new_status
            report.save()

            serializer = self.get_serializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Citizen boleh mengajukan draft miliknya sendiri menjadi REPORTED
        if (
            report.reporter == request.user
            and report.status == 'DRAFT'
            and request.data.get('status') == 'REPORTED'
            and set(request.data.keys()) == {'status'}
        ):
            report.status = 'REPORTED'
            report.save()

            serializer = self.get_serializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().partial_update(request, *args, **kwargs)