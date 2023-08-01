"""DiffusionMaster image generation. Port of utils/imageFinder.ts
(createWebSocketConnection + sendNewTaskMessage + generateImages controller flow).

Protocol: connect -> server sends {newConnectionSessionUUID} -> send
{newTask: {prompt, ...}} -> collect {newImages: {images}} -> close.
API key comes from IMAGE_GENERATOR_KEY env (Node hardcoded it — moved to env).
"""

import json
import logging
from typing import Any

logger = logging.getLogger("hearthstone.images")


async def generate_images(prompt: str, api_key: str, ws_url: str) -> list:
    import websockets

    images: list = []
    async with websockets.connect(ws_url, max_size=10 * 1024 * 1024) as ws:
        await ws.send(json.dumps({"newConnection": {"apiKey": api_key}}))
        async for raw in ws:
            try:
                response = json.loads(raw)
            except ValueError:
                continue
            if "newConnectionSessionUUID" in response:
                await ws.send(json.dumps(_new_task_message(prompt)))
            if "newImages" in response:
                new_images = response["newImages"].get("images", [])
                images = images + new_images
                break
    return images


def _new_task_message(prompt: str) -> dict[str, Any]:
    return {"newTask": {"prompt": prompt, "numImages": 6}}


async def generate_images_from_settings(prompt: str, settings: Any) -> list:
    ws_url = getattr(settings, "diffusionmaster_ws_url", "wss://ws-api.diffusionmaster.com/v1/")
    return await generate_images(prompt, settings.image_generator_key, ws_url)
