from django.urls import path
from . import views

urlpatterns = [

    path('register/', views.register),
    path('login/', views.login),

    path('cards/', views.get_cards),
    path('cards/create/', views.create_card),
    path('cards/delete/<str:card_id>/', views.delete_card),
    path('cards/rating/<str:card_id>/', views.update_rating),

    path('cards/<str:card_id>/', views.get_card),
    path('orders/', views.get_orders),
    path('orders/create/', views.create_order),

    path('cart/', views.get_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/remove/<str:item_id>/', views.remove_from_cart),

    path('wishlist/', views.get_wishlist),
    path('wishlist/add/', views.add_to_wishlist),
    path('wishlist/remove/<str:item_id>/', views.remove_from_wishlist),

]