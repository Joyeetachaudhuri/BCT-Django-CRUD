from django.urls import path
from . import views

urlpatterns = [

    path('register/', views.register),
    path('login/', views.login),

    path('cards/', views.get_cards),
    path('cards/create/', views.create_card),
    path('cards/delete/<str:card_id>/', views.delete_card),
    path('cards/rating/<str:card_id>/', views.update_rating),

]