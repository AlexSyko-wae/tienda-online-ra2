from rest_framework import serializers


class NumberQuerySerializer(serializers.Serializer):
    number = serializers.IntegerField(min_value=0, max_value=999999, default=125)


class NumberResultSerializer(serializers.Serializer):
    number = serializers.IntegerField()
    words = serializers.CharField()
    provider = serializers.CharField()
    protocol = serializers.CharField()
    operation = serializers.CharField()
