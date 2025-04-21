import os
import sys
import uvicorn
from fastapi import FastAPI
from app.db.database import create_tables

def main():
    """
    Set up the database for the password manager
    """
    print("Initializing database for Secure Password Manager...")
    create_tables()
    print("Database tables created successfully!")
    print("\nYou can now run the application with:")
    print("python -m uvicorn main:app --reload")

if __name__ == "__main__":
    main()