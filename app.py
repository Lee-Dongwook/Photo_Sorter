"""
Photo Sorter Streamlit 웹 대시보드
실행: streamlit run app.py
"""
import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가 (config, src import용)
sys.path.insert(0, str(Path(__file__).resolve().parent))

import streamlit as st

from config import (
    COPY_MODE,
    DISTANCE_THRESHOLD,
    OUTPUT_DIR,
    REFERENCE_DIR,
    TARGET_DIR,
)
from src.sorter import classify_and_save, load_reference_encodings

st.set_page_config(page_title="Photo Sorter", page_icon="📷", layout="wide")
st.title("📷 Photo Sorter")
st.caption("얼굴 인식 기반 사진 분류 — Reference 로드 → 대상 스캔 → 매칭 → 결과")

st.sidebar.header("설정")
st.sidebar.markdown(f"- **Reference:** `{REFERENCE_DIR}`")
st.sidebar.markdown(f"- **Target:** `{TARGET_DIR}`")
st.sidebar.markdown(f"- **Output:** `{OUTPUT_DIR}`")
st.sidebar.markdown(f"- **Threshold:** {DISTANCE_THRESHOLD}")
st.sidebar.markdown(f"- **모드:** {'복사' if COPY_MODE else '이동'}")

run = st.sidebar.button("🔄 분류 실행")

if run:
    with st.spinner("Reference 인코딩 로드 중…"):
        reference_encodings = load_reference_encodings(REFERENCE_DIR)

    if not reference_encodings:
        st.warning(
            f"Reference 폴더(`{REFERENCE_DIR}`)에 인물 기준 사진이 없거나 "
            "얼굴이 검출되지 않았습니다. kids/철수.jpg, kids/영희.jpg 형태로 넣어 주세요."
        )
        st.stop()

    with st.spinner("대상 사진 스캔·매칭 중…"):
        result = classify_and_save(
            TARGET_DIR,
            OUTPUT_DIR,
            reference_encodings,
            DISTANCE_THRESHOLD,
            copy_mode=COPY_MODE,
        )

    total = sum(len(paths) for paths in result.values())
    if total == 0:
        st.info(f"대상 폴더(`{TARGET_DIR}`)에 분류할 이미지가 없습니다.")
        st.stop()

    st.success(f"분류 완료 — 총 **{total}**장")
    st.subheader("결과 요약")

    for name, paths in sorted(result.items(), key=lambda x: -len(x[1])):
        with st.expander(f"**{name}** — {len(paths)}장", expanded=(len(paths) <= 10)):
            for i, p in enumerate(paths[:50], 1):
                st.text(f"  {i}. {p.name}")
            if len(paths) > 50:
                st.caption(f"… 외 {len(paths) - 50}장")

else:
    st.info("왼쪽 사이드바에서 **분류 실행** 버튼을 누르면 결과가 여기에 표시됩니다.")
    if not TARGET_DIR.is_dir():
        st.caption(f"💡 `{TARGET_DIR}` 폴더를 만들고 분류할 사진을 넣어 두세요.")
    if not REFERENCE_DIR.is_dir():
        st.caption(f"💡 `{REFERENCE_DIR}` 폴더를 만들고 인물별 기준 사진(파일명=이름)을 넣어 두세요.")
