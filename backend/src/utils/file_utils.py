from pathlib import Path

_CONTENT_TYPE_MAP = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/x-emf": "emf",
    "image/x-wmf": "wmf",
}


def get_file_ext(filename: str) -> str:
    return Path(filename).suffix[1:]


def get_extension_from_content_type(content_type: str) -> str:
    return _CONTENT_TYPE_MAP[content_type]
