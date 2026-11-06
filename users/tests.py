from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
User = get_user_model()

class UserSecurityTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username='admin', email='admin@example.com', password='Admin-Example-83!')
        self.user = User.objects.create_user(username='cliente', email='cliente@example.com', password='Client-Example-74!', telefono='6531234567')
        self.client = APIClient()
        r = self.client.post('/api/v1/auth/token/', {'email': self.admin.email, 'password': 'Admin-Example-83!'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.token = r.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        self.url = f'/api/v1/users/{self.user.pk}/'

    def test_token_lifetime(self):
        t = AccessToken(self.token)
        self.assertEqual(t['exp'] - t['iat'], 1800)

    def test_no_password_in_read_responses(self):
        for url in ['/api/v1/auth/me/', '/api/v1/users/', self.url]:
            r = self.client.get(url)
            self.assertEqual(r.status_code, 200)
            for row in r.data if isinstance(r.data, list) else [r.data]:
                self.assertNotIn('password', row)
                self.assertIn('telefono', row)

    def test_patch_without_password(self):
        self.check_unchanged('patch', {'telefono': '6539998877'})

    def test_put_without_password(self):
        self.check_unchanged('put', {'username': 'cliente', 'email': 'cliente@example.com', 'telefono': '6539998877'})

    def check_unchanged(self, method, data):
        before = self.user.password
        r = getattr(self.client, method)(self.url, data, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.password, before)
        self.assertTrue(self.user.check_password('Client-Example-74!'))
        self.assertFalse(self.user.check_password('Admin-Example-83!'))
        self.assertNotIn('password', r.data)
        login = APIClient().post('/api/v1/auth/token/', {'email': self.user.email, 'password': 'Client-Example-74!'}, format='json')
        self.assertEqual(login.status_code, 200)

    def test_explicit_password_change(self):
        r = self.client.patch(self.url, {'password': 'New-Client-Example-95!'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('New-Client-Example-95!'))
        self.assertFalse(self.user.check_password('Client-Example-74!'))
        self.assertNotIn('password', r.data)

    def test_create_hashes_password(self):
        r = self.client.post('/api/v1/users/', {'username': 'nuevo', 'email': 'nuevo@example.com', 'password': 'New-User-Example-66!', 'telefono': '6531112233'}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertNotIn('password', r.data)
        self.assertTrue(User.objects.get(pk=r.data['id']).check_password('New-User-Example-66!'))

    def test_missing_empty_password_rejected(self):
        self.assertEqual(self.client.post('/api/v1/users/', {'username': 'nuevo', 'email': 'nuevo@example.com'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(self.url, {'password': ''}, format='json').status_code, 400)

    def test_permissions(self):
        c = APIClient()
        self.assertEqual(c.get('/api/v1/auth/me/').status_code, 401)
        r = c.post('/api/v1/auth/token/', {'email': self.user.email, 'password': 'Client-Example-74!'}, format='json')
        c.credentials(HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
        self.assertEqual(c.get('/api/v1/auth/me/').status_code, 200)
        self.assertEqual(c.get('/api/v1/users/').status_code, 403)
        self.assertEqual(c.patch(self.url, {'is_staff': True}, format='json').status_code, 403)

    def test_swagger(self):
        r = APIClient().get('/swagger.json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['info']['title'], 'Tienda Online API')
        self.assertIn('telefono', r.data['definitions']['User']['properties'])
        self.assertTrue(any('auth/me/' in p for p in r.data['paths']))

    def test_delete(self):
        self.assertEqual(self.client.delete(self.url).status_code, 204)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())


class RegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/auth/register/'
        self.data = {'username': 'registro', 'email': 'registro@example.com',
                     'first_name': 'Alex', 'telefono': '6531234567',
                     'password': 'Tropical-Cactus-88!', 'password_confirm': 'Tropical-Cactus-88!'}

    def test_register_and_login_without_privileges(self):
        r = self.client.post(self.url, {**self.data, 'is_staff': True, 'is_superuser': True}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertNotIn('password', r.data)
        self.assertNotIn('password_confirm', r.data)
        u = User.objects.get(email=self.data['email'])
        self.assertFalse(u.is_staff)
        self.assertFalse(u.is_superuser)
        self.assertTrue(u.check_password(self.data['password']))
        login = self.client.post('/api/v1/auth/token/', {'email': self.data['email'], 'password': self.data['password']}, format='json')
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + login.data['access'])
        self.assertEqual(self.client.get('/api/v1/auth/me/').data['telefono'], '6531234567')
        self.assertEqual(self.client.get('/api/v1/users/').status_code, 403)

    def test_rejects_confirmation_mismatch_and_weak_password(self):
        for values in [{'password_confirm': 'Otra-Example-99!'}, {'password': '123', 'password_confirm': '123'}]:
            self.assertEqual(self.client.post(self.url, {**self.data, **values}, format='json').status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_registration(self):
        self.assertEqual(self.client.post(self.url, self.data, format='json').status_code, 201)
        self.assertEqual(self.client.post(self.url, self.data, format='json').status_code, 400)

    def test_cors_allows_vite_only(self):
        allowed = self.client.options(self.url, HTTP_ORIGIN='http://127.0.0.1:5173', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
        self.assertEqual(allowed['Access-Control-Allow-Origin'], 'http://127.0.0.1:5173')
        denied = self.client.options(self.url, HTTP_ORIGIN='https://untrusted.example', HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST')
        self.assertNotIn('Access-Control-Allow-Origin', denied)
