from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False,
                                     trim_whitespace=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telefono', 'password', 'is_active', 'is_staff']
        read_only_fields = ['id']

    def validate(self, attrs):
        if self.instance is None and 'password' not in attrs:
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria al crear.'})
        if 'password' in attrs:
            candidate = User()
            if self.instance:
                candidate = User(username=self.instance.username, email=self.instance.email,
                                 first_name=self.instance.first_name, last_name=self.instance.last_name)
            for field in ('username', 'email', 'first_name', 'last_name'):
                if field in attrs:
                    setattr(candidate, field, attrs[field])
            try:
                validate_password(attrs['password'], user=candidate)
            except ValidationError as exc:
                raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        # Sin password en PUT o PATCH, se conserva el hash del usuario editado.
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
