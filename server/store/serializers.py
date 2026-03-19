from .models import User, ClothingCard
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