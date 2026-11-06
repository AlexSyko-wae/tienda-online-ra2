from django.contrib import admin
from django.urls import include, path, re_path
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

schema_view = get_schema_view(
    openapi.Info(title='Tienda Online API', default_version='v1',
                 description='Productos, categorías y usuarios de una tienda en línea.'),
    public=True, permission_classes=[AllowAny], authentication_classes=[],
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('products.urls')),
    path('api/v1/', include('users.urls')),
    path('api/v1/integrations/', include('integrations.urls')),
    # Compatibilidad con las rutas de la Unidad 1.
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair_legacy'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_legacy'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
