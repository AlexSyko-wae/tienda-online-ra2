from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from requests.exceptions import Timeout
from rest_framework.test import APIClient


class SoapTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        user = get_user_model().objects.create_user(username='soap', email='soap@example.com', password='Soap-Test-83!')
        self.client.force_authenticate(user)
        self.url = '/api/v1/integrations/soap/number-to-words/'

    def test_requires_authentication(self):
        self.assertEqual(APIClient().get(self.url).status_code, 401)

    @patch('integrations.views.number_to_words', return_value='one hundred and twenty five')
    def test_delegates_to_soap_service(self, service):
        r = self.client.get(self.url, {'number': 125})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['words'], 'one hundred and twenty five')
        self.assertEqual(r.data['protocol'], 'SOAP')
        service.assert_called_once_with(125)

    @patch('integrations.views.number_to_words')
    def test_validates_before_calling_provider(self, service):
        for value in ['-1', '1.5', 'abc', '1000000']:
            self.assertEqual(self.client.get(self.url, {'number': value}).status_code, 400)
        service.assert_not_called()

    @patch('integrations.views.number_to_words', side_effect=Timeout())
    def test_external_failure_returns_502(self, service):
        r = self.client.get(self.url, {'number': 125})
        self.assertEqual(r.status_code, 502)
        self.assertIn('detail', r.data)
