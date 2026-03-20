import asyncio
import logging
import smtplib
from html import escape
from email.message import EmailMessage
from email.utils import formataddr
from typing import Iterable
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.family_member import FamilyMember
from app.models.user import User

logger = logging.getLogger(__name__)


def _is_email(value: str) -> bool:
    v = (value or "").strip()
    return "@" in v and "." in v.split("@")[-1]


def _send_email_sync(to_email: str, subject: str, body: str, html_body: str) -> None:
    settings = get_settings()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.smtp_from_name, settings.smtp_from_email))
    msg["To"] = to_email
    msg.set_content(body)
    msg.add_alternative(html_body, subtype="html")

    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        return

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username and settings.smtp_password:
            server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(msg)


def _member_name(member: FamilyMember | None) -> str:
    if not member:
        return "Участник семьи"
    full_name = f"{member.first_name} {member.last_name}".strip()
    return full_name or member.nickname or "Участник семьи"


async def notify_participants_about_publication(
    *,
    db: AsyncSession,
    participant_ids: Iterable[str],
    family_id: UUID,
    author_id: UUID,
    publication_id: UUID,
    publication_title: str | None,
) -> None:
    settings = get_settings()
    if not settings.smtp_enabled:
        return

    ids = {pid for pid in participant_ids if pid}
    if not ids:
        return

    author = await db.get(FamilyMember, author_id)
    author_name = _member_name(author)
    publication_link = f"{settings.frontend_url.rstrip('/')}/classic/publication/{publication_id}"
    title = (publication_title or "").strip() or "Новая публикация"
    subject = "Вас отметили в публикации"
    body = (
        f"{author_name} отметил(а) вас в публикации.\n\n"
        f"Название: {title}\n"
        f"Ссылка: {publication_link}\n"
    )
    html_body = (
        "<html><body>"
        f"<p>{escape(author_name)} отметил(а) вас в публикации.</p>"
        f"<p><b>Название:</b> {escape(title)}</p>"
        f"<p><a href=\"{escape(publication_link)}\">Открыть публикацию</a></p>"
        "</body></html>"
    )

    try:
        parsed_ids = [UUID(pid) for pid in ids]
    except ValueError:
        parsed_ids = []
    if not parsed_ids:
        return

    result = await db.execute(
        select(User.identifier)
        .where(User.family_id == family_id)
        .where(User.member_id.in_(parsed_ids))
        .where(User.member_id != author_id)
    )
    recipients = [identifier for (identifier,) in result.all() if identifier and _is_email(identifier)]
    for email in recipients:
        try:
            await asyncio.to_thread(_send_email_sync, email, subject, body, html_body)
        except Exception:
            logger.exception("Failed to send mention email to %s", email)
