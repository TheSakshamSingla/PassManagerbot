# Secure Telegram Password Manager

A zero-knowledge password manager that runs as a Telegram Mini App, ensuring complete security with client-side encryption.

## Features

- 🔒 **Zero-Knowledge Architecture**: Your passwords are encrypted client-side using AES-256-GCM before being sent to the server
- 🔑 **Master Password**: Single master password to access all your stored passwords
- 🔄 **Password Generator**: Built-in secure password generator
- 📱 **Telegram Integration**: Works seamlessly within Telegram using Mini Apps
- 🔍 **Search & Organize**: Easily find and manage your stored passwords
- ⏱️ **Auto-Lock**: Automatic locking after period of inactivity

## Security Architecture

This password manager follows industry best practices for security:

- Master password never leaves your device
- Uses PBKDF2 with 100,000 iterations to derive encryption keys
- AES-256-GCM for authenticated encryption
- SHA-256 for integrity verification
- Telegram authentication for user validation
- Auto-clearing clipboard after 60 seconds
- Auto-locking after 5 minutes of inactivity

## Repository Structure

```
/backend               # FastAPI backend
  /app                 # Application code
    /api               # API routes
    /core              # Core functionality and config
    /db                # Database models and operations
  main.py              # Entry point
  Procfile             # For Heroku deployment
  requirements.txt     # Python dependencies
  runtime.txt          # Python version for Heroku

/frontend              # React frontend (Telegram Mini App)
  /public              # Static assets
  /src                 # Source code
    /components        # Reusable components
    /hooks             # Custom React hooks
    /pages             # Page components
    /utils             # Utility functions
```

## Setup Instructions

### Prerequisites

- Python 3.11+ (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL database
- Telegram Bot (created using @BotFather)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheSakshamSingla/PassManagerbot.git
   cd "Password Manager/backend"
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy example env file
   cp .env.example .env
   # Edit the file with your settings
   ```
   
   Required environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `TELEGRAM_BOT_TOKEN`: Obtained from @BotFather
   - `TELEGRAM_MINI_APP_DOMAIN`: Your deployed frontend URL

5. **Initialize the database**
   ```bash
   python setup.py
   ```

6. **Start the server**
   ```bash
   uvicorn main:app --reload
   ```
   The API should now be running at http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd "Password Manager/frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend should now be running at http://localhost:3000

## Deployment

### Backend Deployment (Heroku)

1. **Create a Heroku app**
   ```bash
   heroku create your-password-manager-api
   ```

2. **Add PostgreSQL add-on**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set environment variables**
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=your_bot_token
   heroku config:set TELEGRAM_MINI_APP_DOMAIN=https://your-frontend-domain.vercel.app
   ```

4. **Deploy to Heroku**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd "Password Manager/frontend"
   vercel
   ```

3. **Set environment variables on Vercel**
   - `VITE_API_URL`: Your deployed API URL (e.g., https://your-password-manager-api.herokuapp.com/api)

4. **Deploy production version**
   ```bash
   vercel --prod
   ```

## Setting up Telegram Bot

1. **Create a bot using @BotFather**
   - Start a chat with @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy your bot token

2. **Set up Mini App**
   - In @BotFather chat, send `/mybots`
   - Select your bot
   - Go to "Bot Settings" > "Menu Button" or "Menu URL"
   - Set your deployed frontend URL

3. **Configure webhook (optional)**
   - Set up a webhook to receive messages to your bot
   ```
   https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook?url={YOUR_API_URL}/webhook
   ```

## Usage

1. **Open your bot in Telegram**
2. **Start the bot with `/start`**
3. **Open the Mini App from the menu button**
4. **Create a strong master password**
5. **Start managing your passwords securely!**

## Development Guidelines

- **Backend**: Follow FastAPI best practices and RESTful API design
- **Frontend**: Keep components small and focused with clear separation of concerns
- **Security**: Never log sensitive information or store plaintext passwords

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend framework
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - Telegram integration
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - For client-side encryption
