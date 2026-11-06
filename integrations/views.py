import logging
from requests.exceptions import RequestException
from zeep.exceptions import Error as ZeepError
from lxml.etree import XMLSyntaxError
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import NumberQuerySerializer, NumberResultSerializer
from .services import number_to_words

logger = logging.getLogger(__name__)


class NumberToWordsView(APIView):
    """Traduce JSON HTTP a una llamada SOAP real de NumberConversion."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(query_serializer=NumberQuerySerializer,
                         responses={200: NumberResultSerializer, 502: 'Proveedor SOAP no disponible'})
    def get(self, request):
        query = NumberQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        number = query.validated_data['number']
        try:
            words = number_to_words(number)
        except (RequestException, ZeepError, XMLSyntaxError, ValueError):
            logger.warning('El proveedor NumberConversion no respondió correctamente.')
            return Response({'detail': 'El servicio SOAP no está disponible. Intenta de nuevo.'},
                            status=status.HTTP_502_BAD_GATEWAY)
        return Response({'number': number, 'words': words, 'provider': 'DataAccess NumberConversion',
                         'protocol': 'SOAP', 'operation': 'NumberToWords'})
