from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    can_submit = serializers.SerializerMethodField()
    can_update_status = serializers.SerializerMethodField()
    next_status = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'category',
            'description',
            'location',
            'status',
            'reporter',
            'created_at',
            'updated_at',
            'is_owner',
            'can_edit',
            'can_delete',
            'can_submit',
            'can_update_status',
            'next_status',
        ]

    def get_reporter(self, obj):
        return "Warga Anonim"

    def get_is_owner(self, obj):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            return obj.reporter == request.user

        return False

    def get_can_edit(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return False

        return (
            request.user.is_member
            and not request.user.is_admin
            and obj.reporter == request.user
            and obj.status == 'DRAFT'
        )

    def get_can_delete(self, obj):
        return self.get_can_edit(obj)

    def get_can_submit(self, obj):
        return self.get_can_edit(obj)

    def get_can_update_status(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return False

        return (
            request.user.is_admin
            and obj.status in ['REPORTED', 'VERIFIED', 'IN_PROGRESS']
        )

    def get_next_status(self, obj):
        transitions = {
            'REPORTED': 'VERIFIED',
            'VERIFIED': 'IN_PROGRESS',
            'IN_PROGRESS': 'RESOLVED',
        }

        return transitions.get(obj.status)