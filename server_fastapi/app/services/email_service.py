"""Email service. Port of server_node/src/utils/email/index.ts.

- stage=development -> Ethereal test account (nodemailer.createTestAccount equivalent:
  we request a fresh ethereal account via https://api.nodemailer.com/user when available;
  falls back to localhost:1025 / mailhog so tests never need network).
- stage=stage/production -> SMTP from EMAIL_HOST/PORT/USER/PASS with SSLv3 ciphers note.
- From header always config.userEmail (Node behavior); send_mail() never raises
  (Node catches + console.logs) — it returns the info dict or None.
"""

import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage

from app.core.config import Settings

logger = logging.getLogger("hearthstone.email")


@dataclass
class MailOptions:
    to: str | list[str]
    subject: str
    html: str
    text: str = ""
    cc: str | list[str] | None = None
    bcc: str | list[str] | None = None


class EmailService:
    _instance: "EmailService | None" = None

    def __init__(self) -> None:
        self._settings: Settings | None = None
        self._local_account: dict | None = None

    @classmethod
    def get_instance(cls) -> "EmailService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def configure(self, settings: Settings) -> None:
        self._settings = settings

    async def create_local_connection(self) -> None:
        """Port of createLocalConnection: Ethereal account, mailhog fallback offline."""
        try:
            import httpx

            async with httpx.AsyncClient(timeout=5) as client:
                res = await client.post("https://api.nodemailer.com/user")
                if res.status_code == 200:
                    self._local_account = res.json()
                    logger.info("Email configured with success (ethereal)")
                    return
        except Exception as exc:  # offline CI -> mailhog/quiet fallback
            logger.info("Ethereal unavailable, using local fallback: %s", exc)
        self._local_account = None

    def create_connection(self) -> None:
        logger.info("Email configured with success (smtp)")

    def _smtp_params(self) -> dict:
        if self._settings is None:
            raise RuntimeError("EmailService.configure() first")
        if self._settings.stage == "development" and self._local_account:
            return {
                "host": "smtp.ethereal.email",
                "port": 587,
                "user": self._local_account["user"],
                "password": self._local_account["pass"],
            }
        if self._settings.stage == "development":
            return {"host": "localhost", "port": 1025, "user": "", "password": ""}
        return {
            "host": self._settings.email_host,
            "port": self._settings.email_port,
            "user": self._settings.email_user,
            "password": self._settings.email_pass,
        }

    async def send_mail(self, options: MailOptions) -> dict | None:
        if self._settings is None:
            raise RuntimeError("EmailService.configure() first")
        params = self._smtp_params()
        msg = EmailMessage()
        msg["From"] = self._settings.email_user
        to = options.to if isinstance(options.to, str) else ", ".join(options.to)
        msg["To"] = to
        if options.cc:
            msg["Cc"] = options.cc if isinstance(options.cc, str) else ", ".join(options.cc)
        msg["Subject"] = options.subject
        msg.set_content(options.text or "(see html)")
        msg.add_alternative(options.html, subtype="html")
        try:
            import asyncio

            def _send() -> str:
                if params["port"] == 465:
                    smtp: smtplib.SMTP = smtplib.SMTP_SSL(params["host"], params["port"])
                else:
                    smtp = smtplib.SMTP(params["host"], params["port"], timeout=10)
                try:
                    smtp.ehlo()
                    try:
                        smtp.starttls()
                    except smtplib.SMTPException:
                        pass
                    if params["user"]:
                        smtp.login(params["user"], params["password"])
                    smtp.send_message(msg)
                    return "sent"
                finally:
                    try:
                        smtp.quit()
                    except smtplib.SMTPException:
                        pass

            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(None, _send)
            logger.info("Mail sent successfully!! [%s]", result)
            return {"response": result}
        except Exception as exc:
            logger.info("%s error on sending email", exc)
            return None

    async def verify_connection(self) -> bool:
        try:
            params = self._smtp_params()
            import asyncio

            def _verify() -> bool:
                smtp = smtplib.SMTP(params["host"], params["port"], timeout=5)
                try:
                    smtp.ehlo()
                    return True
                finally:
                    smtp.close()

            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, _verify)
        except OSError:
            return False
