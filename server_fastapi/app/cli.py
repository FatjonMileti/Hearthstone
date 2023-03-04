"""Dev CLI entrypoint. Full create-agent lands in Phase 2 Task 12 (port of cli.ts)."""

import typer

app = typer.Typer(help="Hearthstone FastAPI dev CLI")


@app.command()
def create_agent() -> None:
    raise NotImplementedError("lands in Phase 2 Task 12")


if __name__ == "__main__":
    app()
