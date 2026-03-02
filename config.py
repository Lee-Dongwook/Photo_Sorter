"""
Photo Sorter 설정
- Reference(기준), Target(대상), Output 경로 및 매칭 임계값
"""
from pathlib import Path

# 경로 (프로젝트 루트 기준)
PROJECT_ROOT = Path(__file__).resolve().parent
REFERENCE_DIR = PROJECT_ROOT / "kids"      # 기준 사진: kids/철수.jpg, kids/영희.jpg
TARGET_DIR = PROJECT_ROOT / "target"       # 분류 대상 사진 폴더
OUTPUT_DIR = PROJECT_ROOT / "output"       # 결과: output/철수/, output/영희/

# 업로드/저장소 (간이 DB — 나중에 실제 DB 또는 IndexedDB 연동으로 교체)
DATA_DIR = PROJECT_ROOT / "data"
UPLOAD_DIR = DATA_DIR / "uploads"          # 업로드된 사진 파일 저장
STORE_DB = DATA_DIR / "store.db"           # 메타데이터 (SQLite)

# 매칭 설정
DISTANCE_THRESHOLD = 0.6   # 유클리드 거리 임계값 (이하면 동일 인물로 매칭)
COPY_MODE = True           # True: 복사, False: 이동
