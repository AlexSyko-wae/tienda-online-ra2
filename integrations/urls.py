from django.urls import path
from .views import NumberToWordsView

urlpatterns = [path('soap/number-to-words/', NumberToWordsView.as_view(), name='soap-number-to-words')]
