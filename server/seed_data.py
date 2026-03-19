import os
import django

# Setup Django environment so we can use models and hashers
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from store.models import User, ClothingCard, Order, CartItem, WishlistItem
from werkzeug.security import generate_password_hash

def seed_data():
    print("Clearing existing data...")
    User.objects.delete()
    ClothingCard.objects.delete()
    Order.objects.delete()
    CartItem.objects.delete()
    WishlistItem.objects.delete()

    print("Seeding Users...")
    try:
        user1 = User(
            username="testuser",
            email="test@example.com",
            password=generate_password_hash("password123"),
            is_admin=True
        )
        user1.save()
        print(f"Created User: {user1.username}")
    except Exception as e:
        print(f"Error creating user: {e}")

    print("\nSeeding Clothing Cards...")
    dummy_clothes = [
        {
            "brand_name": "Nike",
            "cloth_name": "Sportswear Club Fleece",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
            "price": 535.00,
            "discount": 10.0,
            "rating": 5
        },
        {
            "brand_name": "Adidas",
            "cloth_name": "Originals Essentials Hoodie",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
            "price": 645.00,
            "discount": 0.0,
            "rating": 4
        },
        {
            "brand_name": "Levi's",
            "cloth_name": "501 Original Fit Jeans",
            "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
            "price": 279.50,
            "discount": 15.0,
            "rating": 5
        },
        {
            "brand_name": "Patagonia",
            "cloth_name": "Better Sweater Jacket",
            "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
            "price": 149.00,
            "discount": 0.0,
            "rating": 5
        },
        {
            "brand_name": "H&M",
            "cloth_name": "Relaxed Fit T-shirt",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
            "price": 14.99,
            "discount": 5.0,
            "rating": 3
        },
        {
            "brand_name": "Zara",
            "cloth_name": "Linen Blend Shirt",
            "image_url": "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop",
            "price": 4439.99,
            "discount": 20.0,
            "rating": 4
        }
    ]

    for cloth in dummy_clothes:
        try:
            c = ClothingCard(**cloth)
            c.save()
            print(f"Created Clothing: {cloth['cloth_name']} by {cloth['brand_name']}")
        except Exception as e:
            print(f"Error creating clothing: {e}")

    print("\nData seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
