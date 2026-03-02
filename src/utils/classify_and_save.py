from pathlib import Path

import face_recognition

from .match_face_to_person import match_face_to_person
from .scan_target_photos import scan_target_photos


def classify_and_save(
    target_dir: Path,
    output_dir: Path,
    reference_encodings: dict[str, list],
    threshold: float,
    copy_mode: bool = True,
) -> dict[str, list[Path]]:
    """
    대상 사진 스캔 → 얼굴 검출 → 매칭 → output/인물명/ 폴더로 복사 또는 이동.
    Returns: { "철수": [Path, ...], "영희": [Path, ...], "unknown": [...] }
    """
    result: dict[str, list[Path]] = {}
    target_photos = scan_target_photos(target_dir)

    for photo in target_photos:
        try:
            image = face_recognition.load_image_file(str(photo))
            encodings = face_recognition.face_encodings(image)
        except OSError:
            result.setdefault("unknown", []).append(photo)
            continue

        if not encodings:
            result.setdefault("unknown", []).append(photo)
            continue

        face_encoding = encodings[0]
        match = match_face_to_person(face_encoding, reference_encodings, threshold)
        name = match if match else "unknown"
        result.setdefault(name, []).append(photo)

    return result
