from rest_framework.generics import RetrieveAPIView, CreateAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet
from .models import User
from .serializers import UserSerializer, RegisterUserSerializer

class UserApiViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('id')

class UserView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class RegisterUserView(CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterUserSerializer
