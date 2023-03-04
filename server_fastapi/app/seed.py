"""DB seed entrypoint. Full seeders land in Phase 2 Task 12 (port of src/seeders/*)."""

import typer

app = typer.Typer(help="Seed the database with faker data")


@app.command()
def run(users: int = 10, properties: int = 10, criteria: int = 5) -> None:
    raise NotImplementedError("lands in Phase 2 Task 12")


if __name__ == "__main__":
    app()
