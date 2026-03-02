"""
Photo Sorter Streamlit 웹 대시보드 (스켈레톤)
실행: streamlit run app.py
"""
import streamlit as st
from pathlib import Path

from config import REFERENCE_DIR, TARGET_DIR, OUTPUT_DIR, DISTANCE_THRESHOLD, COPY_MODE

st.set_page_config(page_title="Photo Sorter", page_icon="📷", layout="wide")
st.title("📷 Photo Sorter")
st.caption("얼굴 인식 기반 사진 분류 — MVP 초기 셋팅")

st.sidebar.header("설정")
st.sidebar.markdown(f"- **Reference:** `{REFERENCE_DIR}`")
st.sidebar.markdown(f"- **Target:** `{TARGET_DIR}`")
st.sidebar.markdown(f"- **Output:** `{OUTPUT_DIR}`")
st.sidebar.markdown(f"- **Threshold:** {DISTANCE_THRESHOLD}")

# TODO: 핵심 로직 연동 후 버튼/폴더 선택 등 UI 추가
st.info("핵심 로직 구현 후 여기서 분류 실행 버튼·결과 미리보기를 연결하세요.")

if st.sidebar.button("분류 실행 (준비 중)"):
    st.warning("sorter.classify_and_save() 구현 후 연동해 주세요.")
