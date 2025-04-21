import hashlib
import hmac
import json
import time
import urllib.parse
from fastapi import Request
from .config import settings

async def validate_telegram_init_data(request: Request) -> str:
    """
    Validates Telegram Mini App initData and returns the user ID if valid
    
    Args:
        request: The FastAPI request object containing init_data in headers
        
    Returns:
        str: The Telegram user ID if valid, None if invalid
    """
    try:
        # Get initData from request header
        init_data = request.headers.get("X-Telegram-Init-Data")
        if not init_data:
            return None
        
        # Parse the initData query string
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        
        # Extract hash and remove it from data to verify
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            return None
        
        # Sort the data alphabetically
        data_check_string = "\n".join([f"{key}={value}" for key, value in sorted(parsed_data.items())])
        
        # Create a secret key by using HMAC-SHA-256 with the bot token
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=settings.TELEGRAM_BOT_TOKEN.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
        # Calculate the hash
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Compare the hashes
        if calculated_hash != received_hash:
            return None
            
        # Check if the auth timestamp is not older than 24 hours
        auth_date = parsed_data.get('auth_date')
        if not auth_date:
            return None
            
        current_time = int(time.time())
        auth_time = int(auth_date)
        if current_time - auth_time > 86400:  # 86400 seconds = 24 hours
            return None
        
        # Extract user data
        user = json.loads(parsed_data.get('user', '{}'))
        user_id = user.get('id')
        
        if not user_id:
            return None
            
        return str(user_id)
    except Exception as e:
        print(f"Error validating Telegram initData: {str(e)}")
        return None