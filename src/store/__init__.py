"""사진 입출력 저장소 — 간이 DB. 나중에 실제 DB 또는 브라우저 IndexedDB 연동으로 교체."""

from .photo_store import PhotoRecord, get_photo_store

__all__ = ["PhotoRecord", "get_photo_store"]
