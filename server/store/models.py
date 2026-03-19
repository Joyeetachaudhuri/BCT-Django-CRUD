from mongoengine import Document, StringField, IntField, FloatField, EmailField, ReferenceField, DateTimeField, BooleanField
import datetime


class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    is_admin = BooleanField(default=False)

    @property
    def is_authenticated(self):
        return True


class ClothingCard(Document):
    brand_name = StringField(required=True)
    cloth_name = StringField(required=True)
    image_url = StringField()
    price = FloatField(required=True)
    discount = FloatField(default=0)

    rating = IntField(
        default=3,
        min_value=1,
        max_value=5
    )

class Order(Document):
    user = ReferenceField('User', required=True)
    card = ReferenceField('ClothingCard', required=True)
    quantity = IntField(default=1)
    total_price = FloatField(required=True)
    status = StringField(default="Pending")
    created_at = DateTimeField(default=datetime.datetime.utcnow)


class CartItem(Document):
    user = ReferenceField('User', required=True)
    card = ReferenceField('ClothingCard', required=True, unique_with='user')
    quantity = IntField(default=1, min_value=1)


class WishlistItem(Document):
    user = ReferenceField('User', required=True)
    card = ReferenceField('ClothingCard', required=True, unique_with='user')
    added_at = DateTimeField(default=datetime.datetime.utcnow)