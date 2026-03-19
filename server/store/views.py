from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, ClothingCard
from .serializers import UserSerializer, ClothingSerializer
from .utils import generate_token
import json


# REGISTER
@api_view(['POST'])
def register(request):

    data = request.data

    # Handle DRF browsable API JSON
    if "_content" in data:
        data = json.loads(data["_content"])

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return Response(
            {"error": "username, email and password are required"},
            status=400
        )

    user = UserSerializer.create_user(data)

    return Response({
        "message": "User created",
        "user_id": str(user.id)
    })


# LOGIN
@api_view(['POST'])
def login(request):

    data = request.data

    if "_content" in data:
        import json
        data = json.loads(data["_content"])

    username = data.get("username")
    password = data.get("password")

    user = User.objects(username=username).first()

    if not user:
        return Response({"error": "User not found"}, status=404)

    if not UserSerializer.verify_password(user, password):
        return Response({"error": "Invalid password"}, status=401)

    token = generate_token(user)

    return Response({
        "token": token
    })


@api_view(['POST'])
def create_card(request):

    data = request.data

    # DRF browsable API sends JSON inside "_content"
    if "_content" in data:
        data = json.loads(data["_content"])

    brand_name = data.get("brand_name")
    cloth_name = data.get("cloth_name")
    image_url = data.get("image_url")
    price = data.get("price")
    discount = data.get("discount", 0)

    if not brand_name or not cloth_name or not price:
        return Response(
            {"error": "brand_name, cloth_name and price are required"},
            status=400
        )

    card = ClothingCard(
        brand_name=brand_name,
        cloth_name=cloth_name,
        image_url=image_url,
        price=float(price),
        discount=float(discount)
    )

    card.save()

    return Response({
        "message": "Card created successfully",
        "id": str(card.id)
    })


# GET ALL CARDS
@api_view(['GET'])
def get_cards(request):

    cards = ClothingCard.objects()

    data = [ClothingSerializer.serialize(card) for card in cards]

    return Response(data)


# DELETE CARD
@api_view(['DELETE'])
def delete_card(request, card_id):

    card = ClothingCard.objects(id=card_id).first()

    if not card:
        return Response({"error": "Card not found"})

    card.delete()

    return Response({
        "message": "Card deleted"
    })


# UPDATE RATING
@api_view(['PUT'])
def update_rating(request, card_id):

    rating = request.data.get("rating")

    if rating < 1 or rating > 5:
        return Response({"error": "Rating must be between 1 and 5"})

    card = ClothingCard.objects(id=card_id).first()

    if not card:
        return Response({"error": "Card not found"})

    card.rating = rating
    card.save()

    return Response({
        "message": "Rating updated",
        "rating": card.rating
    })