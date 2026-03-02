"""
Photo Sorter CLI 진입점
사용 예: python main.py
"""
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import REFERENCE_DIR, TARGET_DIR, OUTPUT_DIR, DISTANCE_THRESHOLD, COPY_MODE
from src.sorter import classify_and_save, load_reference_encodings


def main() -> None:
    """학습 데이터 로드 → 대상 스캔 → 비교 → 분류 실행 (핵심 로직 구현 후 사용)."""
    # TODO: load_reference_encodings, classify_and_save 구현 후 아래 주석 해제
    # reference_encodings = load_reference_encodings(REFERENCE_DIR)
    # result = classify_and_save(
    #     TARGET_DIR, OUTPUT_DIR, reference_encodings, DISTANCE_THRESHOLD, COPY_MODE
    # )
    # for name, paths in result.items():
    #     print(f"{name}: {len(paths)}장")
    print("Photo Sorter MVP - 핵심 로직 구현 후 main()에서 호출하세요.")


if __name__ == "__main__":
    main()
