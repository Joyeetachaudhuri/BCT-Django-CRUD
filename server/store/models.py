from mongoengine import Document, StringField, IntField, FloatField, EmailField


class User(Document):
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)


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