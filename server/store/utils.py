import jwt
from django.conf import settings
from datetime import datetime, timedelta


def generate_token(user):

    payload = {
        "user_id": str(user.id),
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return token