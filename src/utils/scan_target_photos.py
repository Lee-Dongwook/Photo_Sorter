from pathlib import Path

def scan_target_photos(target_dir: Path) -> list[Path]:
    """대상 폴더에서 분류할 사진 파일 목록 반환 (이미지 확장자만)."""
    if not target_dir.is_dir():
        return []

    target_photos = []

    for file in target_dir.glob("**/*"):
        if file.is_file() and file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
            target_photos.append(file)

    return target_photos
