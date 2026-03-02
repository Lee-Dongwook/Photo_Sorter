"""
사진 저장소 — 인터페이스 + SQLite 구현.
나중에 Postgres/IndexedDB 등으로 교체할 수 있도록 저장/조회만 담당.
"""
from __future__ import annotations

import sqlite3
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from config import STORE_DB, UPLOAD_DIR


@dataclass
class PhotoRecord:
    """저장된 사진 한 건 메타."""
    id: str
    filename: str
    path: Path
    created_at: str


class PhotoStore(Protocol):
    """사진 저장소 프로토콜 (나중에 DB/IndexedDB 구현체로 교체)."""

    def save(self, data: bytes, filename: str) -> str:
        """저장 후 id 반환."""
        ...

    def list_photos(self) -> list[PhotoRecord]:
        """저장된 사진 목록 (최신순)."""
        ...

    def get_path(self, id: str) -> Path | None:
        """id에 해당하는 파일 경로. 없으면 None."""
        ...

    def delete(self, id: str) -> bool:
        """삭제. 성공 여부."""
        ...

    def dir_for_scan(self) -> Path:
        """분류 스캔에 쓸 디렉터리 (이 폴더를 target_dir로 사용)."""
        ...


class SQLitePhotoStore:
    """SQLite + 파일 디렉터리 기반 간이 저장소."""

    def __init__(self, db_path: Path | None = None, upload_dir: Path | None = None) -> None:
        self._db = db_path or STORE_DB
        self._upload_dir = upload_dir or UPLOAD_DIR
        self._upload_dir.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        self._db.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self._db) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS photos (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    path TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )

    def save(self, data: bytes, filename: str) -> str:
        id = uuid.uuid4().hex
        ext = Path(filename).suffix or ".jpg"
        path = self._upload_dir / f"{id}{ext}"
        path.write_bytes(data)
        created_at = __import__("datetime").datetime.now().isoformat()
        with sqlite3.connect(self._db) as conn:
            conn.execute(
                "INSERT INTO photos (id, filename, path, created_at) VALUES (?, ?, ?, ?)",
                (id, filename, str(path), created_at),
            )
        return id

    def list_photos(self) -> list[PhotoRecord]:
        with sqlite3.connect(self._db) as conn:
            rows = conn.execute(
                "SELECT id, filename, path, created_at FROM photos ORDER BY created_at DESC"
            ).fetchall()
        return [
            PhotoRecord(id=r[0], filename=r[1], path=Path(r[2]), created_at=r[3])
            for r in rows
        ]

    def get_path(self, id: str) -> Path | None:
        with sqlite3.connect(self._db) as conn:
            row = conn.execute("SELECT path FROM photos WHERE id = ?", (id,)).fetchone()
        return Path(row[0]) if row and Path(row[0]).exists() else None

    def delete(self, id: str) -> bool:
        path = self.get_path(id)
        if path and path.exists():
            path.unlink(missing_ok=True)
        with sqlite3.connect(self._db) as conn:
            cur = conn.execute("DELETE FROM photos WHERE id = ?", (id,))
            return cur.rowcount > 0

    def dir_for_scan(self) -> Path:
        return self._upload_dir


_store: SQLitePhotoStore | None = None


def get_photo_store() -> SQLitePhotoStore:
    """싱글톤 저장소 (config 경로 사용)."""
    global _store
    if _store is None:
        _store = SQLitePhotoStore()
    return _store
