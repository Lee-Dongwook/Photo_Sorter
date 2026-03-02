"""
Photo Sorter 핵심 모듈 (스켈레톤)
워크플로우: [학습 데이터 로드] → [대상 사진 스캔] → [얼굴 인코딩 비교] → [파일 분류]
"""
from pathlib import Path

from src.utils.classify_and_save import classify_and_save
from src.utils.load_reference_encodings import load_reference_encodings
from src.utils.match_face_to_person import match_face_to_person
from src.utils.scan_target_photos import scan_target_photos
