from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import User, ClothingCard, Order, CartItem, WishlistItem
from .serializers import UserSerializer, ClothingSerializer, OrderSerializer, CartItemSerializer, WishlistItemSerializer
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
        "user_id": str(user.id),
        "is_admin": getattr(user, 'is_admin', False)
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
        "token": token,
        "is_admin": getattr(user, 'is_admin', False),
        "username": user.username
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_card(request):
    if not getattr(request.user, 'is_admin', False):
        return Response({"error": "Admin privileges required to create products"}, status=403)

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
@permission_classes([IsAuthenticated])
def delete_card(request, card_id):
    if not getattr(request.user, 'is_admin', False):
        return Response({"error": "Admin privileges required to delete products"}, status=403)

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

    card.rating = rating
    card.save()

    return Response({
        "message": "Rating updated",
        "rating": card.rating
    })


# GET SINGLE CARD
@api_view(['GET'])
def get_card(request, card_id):
    card = ClothingCard.objects(id=card_id).first()
    if not card:
        return Response({"error": "Card not found"}, status=404)
        
    data = ClothingSerializer.serialize(card)
    return Response(data)


# CREATE ORDER
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    data = request.data

    if "_content" in data:
        data = json.loads(data["_content"])

    card_id = data.get("card_id")
    quantity = int(data.get("quantity", 1))

    if not card_id:
        return Response({"error": "card_id is required"}, status=400)

    card = ClothingCard.objects(id=card_id).first()
    if not card:
        return Response({"error": "Card not found"}, status=404)

    total_price = float(card.price) * quantity
    if card.discount > 0:
        total_price = total_price - (total_price * (card.discount / 100))

    order = Order(
        user=request.user,
        card=card,
        quantity=quantity,
        total_price=total_price
    )
    order.save()

    return Response({
        "message": "Order created successfully",
        "order_id": str(order.id)
    })


# GET ORDERS FOR USER
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    # order_by is prefixed with '-' for descending
    orders = Order.objects(user=request.user).order_by('-created_at')
    data = [OrderSerializer.serialize(order) for order in orders]
    return Response(data)


# ── CART ──

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    items = CartItem.objects(user=request.user)
    data = [CartItemSerializer.serialize(item) for item in items]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    data = request.data
    if "_content" in data:
        data = json.loads(data["_content"])

    card_id = data.get("card_id")
    quantity = int(data.get("quantity", 1))

    if not card_id:
        return Response({"error": "card_id is required"}, status=400)

    card = ClothingCard.objects(id=card_id).first()
    if not card:
        return Response({"error": "Card not found"}, status=404)

    existing = CartItem.objects(user=request.user, card=card).first()
    if existing:
        existing.quantity += quantity
        existing.save()
        return Response({"message": "Cart updated", "id": str(existing.id), "quantity": existing.quantity})

    item = CartItem(user=request.user, card=card, quantity=quantity)
    item.save()
    return Response({"message": "Added to cart", "id": str(item.id)})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    item = CartItem.objects(id=item_id, user=request.user).first()
    if not item:
        return Response({"error": "Cart item not found"}, status=404)
    item.delete()
    return Response({"message": "Removed from cart"})


# ── WISHLIST ──

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    items = WishlistItem.objects(user=request.user).order_by('-added_at')
    data = [WishlistItemSerializer.serialize(item) for item in items]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    data = request.data
    if "_content" in data:
        data = json.loads(data["_content"])

    card_id = data.get("card_id")
    if not card_id:
        return Response({"error": "card_id is required"}, status=400)

    card = ClothingCard.objects(id=card_id).first()
    if not card:
        return Response({"error": "Card not found"}, status=404)

    existing = WishlistItem.objects(user=request.user, card=card).first()
    if existing:
        return Response({"message": "Already in wishlist", "id": str(existing.id)})

    item = WishlistItem(user=request.user, card=card)
    item.save()
    return Response({"message": "Added to wishlist", "id": str(item.id)})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, item_id):
    item = WishlistItem.objects(id=item_id, user=request.user).first()
    if not item:
        return Response({"error": "Wishlist item not found"}, status=404)
    item.delete()
    return Response({"message": "Removed from wishlist"})