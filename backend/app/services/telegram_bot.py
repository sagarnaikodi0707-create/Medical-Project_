"""
ReportSaathi Telegram Bot
Accepts PDF/JPG/PNG lab reports and returns plain-language explanations.
Bot token is NEVER logged. Report text is NEVER logged.
"""
import logging
import tempfile
import os
from pathlib import Path

logger = logging.getLogger("reportsaathi.telegram")

SUPPORTED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
}
SUPPORTED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB

WELCOME_MESSAGE = """👋 Welcome to *ReportSaathi Bot*!

I can explain your medical laboratory reports in simple, plain language for educational purposes.

📋 *How to use:*
• Send me a PDF, JPG or PNG of your lab report
• I'll extract and explain the key findings

⚠️ *Important disclaimer:*
This bot is for *educational purposes only*. It does NOT provide medical advice, diagnoses, or treatment recommendations. Always consult a qualified healthcare professional.

Send your report to get started!"""

DISCLAIMER = (
    "\n\n⚠️ _Educational purposes only. Not medical advice. "
    "Always consult a qualified healthcare professional for personal health decisions._"
)


def _format_bot_reply(analysis: dict) -> str:
    """Format a short summary reply for Telegram from the structured analysis."""
    title = analysis.get("report_title", "Your Lab Report")
    overview = analysis.get("overview_summary", "")
    findings = analysis.get("key_findings", [])
    parameters = analysis.get("parameters", [])
    is_clarity = analysis.get("is_clarity_issue", False)

    lines = [f"📊 *{title}*"]

    if is_clarity:
        lines.append("\n⚠️ _Note: Some parts of this report were unclear. Results may be incomplete._")

    if overview:
        lines.append(f"\n{overview}")

    if findings:
        lines.append("\n*Key Findings:*")
        for f in findings[:5]:
            lines.append(f"• {f}")

    if parameters:
        lines.append("\n*Test Results:*")
        shown = 0
        for p in parameters:
            if shown >= 8:
                remaining = len(parameters) - shown
                lines.append(f"_...and {remaining} more tests_")
                break
            name = p.get("name", "Unknown")
            value = p.get("value", "N/A")
            unit = p.get("unit", "")
            status = p.get("status", "")
            explanation = p.get("simple_explanation", "")

            status_emoji = {"HIGH": "🔴", "LOW": "🔵", "NORMAL": "🟢", "UNKNOWN": "⚪"}.get(status, "⚪")
            line = f"{status_emoji} *{name}*: {value} {unit}".rstrip()
            if explanation:
                line += f"\n   _{explanation[:120]}{'...' if len(explanation) > 120 else ''}_"
            lines.append(line)
            shown += 1

    lines.append(DISCLAIMER)
    return "\n".join(lines)


async def run_bot():
    """Start the Telegram bot polling loop."""
    from app.config import settings

    token = settings.TELEGRAM_BOT_TOKEN
    if not token or len(token.strip()) < 10:
        logger.error("TELEGRAM_BOT_TOKEN is not configured. Bot will not start.")
        print("ERROR: TELEGRAM_BOT_TOKEN not set in backend/.env — Telegram bot cannot start.")
        return

    try:
        from telegram import Update
        from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
    except ImportError:
        logger.error("python-telegram-bot not installed. Run: pip install python-telegram-bot>=20.0")
        print("ERROR: Install python-telegram-bot>=20.0 first.")
        return

    # Import processing pipeline (lazy to avoid circular imports)
    from app.services.extractor import extract_text_from_document
    from app.services.gemini_service import analyze_report_with_gemini
    from app.services.parser import parse_report_fallback

    async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text(WELCOME_MESSAGE, parse_mode="Markdown")

    async def document_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        message = update.message
        doc = message.document or (message.photo[-1] if message.photo else None)

        if not doc:
            await message.reply_text(
                "Please send a PDF, JPG, or PNG file of your lab report.",
                parse_mode="Markdown"
            )
            return

        # Determine file type
        if message.document:
            mime_type = message.document.mime_type or ""
            file_name = message.document.file_name or "report"
            file_size = message.document.file_size or 0
            file_ref = message.document
        else:
            # Photo (always JPEG from Telegram)
            mime_type = "image/jpeg"
            file_name = "photo.jpg"
            file_size = message.photo[-1].file_size or 0
            file_ref = message.photo[-1]

        # Validate type
        ext = SUPPORTED_MIME_TYPES.get(mime_type)
        if not ext:
            name_ext = Path(file_name).suffix.lower()
            if name_ext not in SUPPORTED_EXTENSIONS:
                await message.reply_text(
                    "❌ Unsupported file type. Please send a *PDF*, *JPG*, or *PNG* lab report.",
                    parse_mode="Markdown"
                )
                return
            ext = name_ext

        # Validate size
        if file_size > MAX_FILE_BYTES:
            await message.reply_text(
                "❌ File is too large (max 10 MB). Please compress the file and try again.",
                parse_mode="Markdown"
            )
            return

        await message.reply_text("🔄 Processing your report... please wait.", parse_mode="Markdown")

        tmp_path = None
        try:
            # Download file to temp
            tg_file = await context.bot.get_file(file_ref.file_id)
            suffix = ext if ext.startswith(".") else f".{ext}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = tmp.name
            await tg_file.download_to_drive(tmp_path)

            # Extract text
            with open(tmp_path, "rb") as f:
                file_bytes = f.read()

            extracted_text = extract_text_from_document(
                file_bytes=file_bytes,
                filename=file_name,
                content_type=mime_type,
            )

            if not extracted_text or len(extracted_text.strip()) < 20:
                await message.reply_text(
                    "⚠️ Could not extract readable text from this file. "
                    "Please ensure the document is not blurry or password-protected.",
                    parse_mode="Markdown"
                )
                return

            # Analyze
            analysis = analyze_report_with_gemini(extracted_text)
            if not analysis:
                analysis = parse_report_fallback(extracted_text)

            if not analysis:
                await message.reply_text(
                    "⚠️ Could not analyze this report. Please consult your healthcare provider directly.",
                    parse_mode="Markdown"
                )
                return

            reply = _format_bot_reply(analysis)
            # Telegram message max 4096 chars
            if len(reply) > 4000:
                reply = reply[:3990] + "\n_[Truncated — full analysis available on the web app]_"

            await message.reply_text(reply, parse_mode="Markdown")

        except Exception as e:
            # Never log file content, only error type
            logger.error(f"Bot document_handler error: {type(e).__name__}: {str(e)[:100]}")
            await message.reply_text(
                "❌ An error occurred while processing your report. "
                "Please try again or use the ReportSaathi web app.",
                parse_mode="Markdown"
            )
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    # Build and start the application
    application = ApplicationBuilder().token(token).build()
    application.add_handler(CommandHandler("start", start_handler))
    application.add_handler(CommandHandler("help", start_handler))
    application.add_handler(MessageHandler(filters.Document.ALL | filters.PHOTO, document_handler))

    logger.info("ReportSaathi Telegram bot starting polling...")
    print("✅ ReportSaathi Telegram Bot is running. Send /start in Telegram.")
    await application.run_polling(allowed_updates=Update.ALL_TYPES)
