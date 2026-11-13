"""
Standalone runner for the ReportSaathi Telegram Bot.
Run from workspace root: python backend/run_telegram_bot.py

Requires TELEGRAM_BOT_TOKEN in backend/.env
"""
import asyncio
import sys
import os

# Ensure backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Load .env from backend directory
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from app.services.telegram_bot import run_bot

if __name__ == "__main__":
    asyncio.run(run_bot())
