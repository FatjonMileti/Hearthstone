"""
Prompts for email/password/first/last (min length 3, like the joi rules in cli.ts),
bcrypt-12 hashes, and creates an enabled Agent user.
"""

import asyncio
from datetime import UTC, datetime
from typing import Any

import typer

app = typer.Typer(help="Hearthstone FastAPI dev CLI")


def _prompt_value(label: str, hide: bool = False) -> str:
    while True:
        value = typer.prompt(label, hide_input=hide).strip()
        if len(value) >= 3:
            return value
        typer.echo("must be at least 3 characters")


async def _create_agent(
    db: Any, *, email: str, password: str, first_name: str, last_name: str
) -> Any:
    from app import models
    from app.core.security import ahash_password

    hashed = await ahash_password(password)
    result = await db[models.USER].insert_one(
        {
            "email": email,
            "hash": hashed,
            "role": "Agent",
            "is_disabled": False,
            "first_name": first_name,
            "last_name": last_name,
            "created_at": datetime.now(UTC),
        }
    )
    return result.inserted_id


@app.command()
def create_agent(
    email: str = typer.Option("", help="Agent email (prompted when empty)"),
    password: str = typer.Option("", help="Agent password (prompted when empty)"),
    first_name: str = typer.Option("", help="First name (prompted when empty)"),
    last_name: str = typer.Option("", help="Last name (prompted when empty)"),
) -> None:
    """Create an enabled Agent user."""
    from app.core.config import get_settings
    from app.core.db import close_db, connect_db, get_client

    email = email or _prompt_value("email/username")
    password = password or _prompt_value("password", hide=True)
    first_name = first_name or _prompt_value("first_name")
    last_name = last_name or _prompt_value("last_name")

    async def _run() -> None:
        settings = get_settings()
        await connect_db(settings.db_connection_string)
        try:
            db = get_client()[settings.mongo_db_name]
            user_id = await _create_agent(
                db,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            typer.echo(f"Agent user created: {user_id}")
        finally:
            await close_db()

    asyncio.run(_run())


if __name__ == "__main__":
    app()
