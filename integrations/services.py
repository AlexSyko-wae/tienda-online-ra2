"""Cliente de un proveedor SOAP fijo; no recibe URLs del usuario."""
from pathlib import Path
from requests import Session
from zeep import Client, Settings
from zeep.transports import Transport

NUMBER_WSDL = 'https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL'


def number_to_words(number):
    # La sesión se cierra incluso si falla la red o el proveedor.
    with Session() as session:
        transport = Transport(session=session, timeout=10, operation_timeout=15)
        session.headers['User-Agent'] = 'TiendaOnline-RA2/1.0'
        # El contrato local evita descargar el WSDL en cada consulta.
        # La operación SOAP sigue llamando al servidor público por HTTPS.
        wsdl_path = Path(__file__).parent / 'wsdl' / 'NumberConversion.wsdl'
        client = Client(str(wsdl_path), transport=transport,
                        settings=Settings(strict=True, forbid_dtd=True,
                                          forbid_entities=True, forbid_external=True,
                                          extra_http_headers={'SOAPAction': '"http://www.dataaccess.com/webservicesserver/NumberToWords"'}))
        result = client.service.NumberToWords(ubiNum=number)
        return str(result).strip()
