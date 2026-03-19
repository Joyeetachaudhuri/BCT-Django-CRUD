from .models import User, ClothingCard, Order, CartItem, WishlistItem
from werkzeug.security import generate_password_hash, check_password_hash


class UserSerializer:

    @staticmethod
    def create_user(data):

        user = User(
            username=data["username"],
            email=data["email"],
            password=generate_password_hash(data["password"])
        )

        user.save()
        return user


    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user.password, password)


class ClothingSerializer:

    @staticmethod
    def serialize(card):

        return {
            "id": str(card.id),
            "brand_name": card.brand_name,
            "cloth_name": card.cloth_name,
            "image_url": card.image_url,
            "price": card.price,
            "discount": card.discount,
            "rating": card.rating
        }

class OrderSerializer:

    @staticmethod
    def serialize(order):
        # order.card is a ReferenceField which is automatically dereferenced
        return {
            "id": str(order.id),
            "user": str(order.user.id) if getattr(order, 'user', None) else None,
            "card": ClothingSerializer.serialize(order.card) if getattr(order, 'card', None) else None,
            "quantity": order.quantity,
            "total_price": order.total_price,
            "status": order.status,
            "created_at": order.created_at.isoformat() if getattr(order, 'created_at', None) else None
        }


class CartItemSerializer:

    @staticmethod
    def serialize(item):
        return {
            "id": str(item.id),
            "card": ClothingSerializer.serialize(item.card) if getattr(item, 'card', None) else None,
            "quantity": item.quantity,
        }


class WishlistItemSerializer:

    @staticmethod
    def serialize(item):
        return {
            "id": str(item.id),
            "card": ClothingSerializer.serialize(item.card) if getattr(item, 'card', None) else None,
            "added_at": item.added_at.isoformat() if getattr(item, 'added_at', None) else None,
        }