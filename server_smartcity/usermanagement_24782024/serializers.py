from rest_framework import serializers
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )

        user.is_admin = False
        user.is_member = True
        user.save()

        return user


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'is_admin',
            'is_member',
            'role',
        ]

    def get_role(self, obj):
        if obj.is_admin:
            return 'admin'

        return 'citizen'