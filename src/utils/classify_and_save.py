from pathlib import Path
import face_recognition
from utils.scan_target_photos import scan_target_photos
from utils.match_face_to_person import match_face_to_person

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
    result = {}
    target_photos = scan_target_photos(target_dir)
    for photo in target_photos:
        face_encoding = face_recognition.face_encodings(photo)[0]
        match = match_face_to_person(face_encoding, reference_encodings, threshold)
        if match:
            result[match].append(photo)
        else:
            result["unknown"].append(photo)
    return result
