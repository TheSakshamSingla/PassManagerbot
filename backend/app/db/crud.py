from .database import database, passwords
from sqlalchemy import select, and_
from typing import List, Dict, Optional, Any

async def store_password(user_id: str, label: str, encrypted_data: str, iv: str, hash_value: str) -> bool:
    """
    Store or update an encrypted password
    
    Args:
        user_id: Telegram user ID
        label: Password label (e.g., "GitHub")
        encrypted_data: AES-GCM encrypted password data
        iv: Initialization Vector used for encryption
        hash_value: SHA-256 hash for integrity verification
    
    Returns:
        bool: True if successful
    """
    # Check if the label already exists for this user
    query = select([passwords.c.id]).where(
        and_(
            passwords.c.user_id == user_id,
            passwords.c.label == label
        )
    )
    
    existing_id = await database.fetch_val(query)
    
    if existing_id:
        # Update existing password
        query = passwords.update().where(
            passwords.c.id == existing_id
        ).values(
            encrypted_data=encrypted_data,
            iv=iv,
            hash=hash_value
        )
        await database.execute(query)
    else:
        # Insert new password
        query = passwords.insert().values(
            user_id=user_id,
            label=label,
            encrypted_data=encrypted_data,
            iv=iv,
            hash=hash_value
        )
        await database.execute(query)
        
    return True

async def get_password(user_id: str, label: str) -> Optional[Dict[str, Any]]:
    """
    Get an encrypted password entry
    
    Args:
        user_id: Telegram user ID
        label: Password label
    
    Returns:
        Dict: Password data or None if not found
    """
    query = select([
        passwords.c.encrypted_data,
        passwords.c.iv,
        passwords.c.hash
    ]).where(
        and_(
            passwords.c.user_id == user_id,
            passwords.c.label == label
        )
    )
    
    result = await database.fetch_one(query)
    
    if not result:
        return None
        
    return {
        "encrypted_data": result["encrypted_data"],
        "iv": result["iv"],
        "hash": result["hash"]
    }

async def list_passwords(user_id: str) -> List[str]:
    """
    List all password labels for a user
    
    Args:
        user_id: Telegram user ID
    
    Returns:
        List[str]: List of password labels
    """
    query = select([passwords.c.label]).where(passwords.c.user_id == user_id)
    results = await database.fetch_all(query)
    
    return [row["label"] for row in results]

async def delete_password(user_id: str, label: str) -> bool:
    """
    Delete a password entry
    
    Args:
        user_id: Telegram user ID
        label: Password label
    
    Returns:
        bool: True if deleted, False if not found
    """
    query = passwords.delete().where(
        and_(
            passwords.c.user_id == user_id,
            passwords.c.label == label
        )
    )
    
    result = await database.execute(query)
    
    # If no rows affected, the password wasn't found
    return result > 0