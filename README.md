# 🤖 Ollama를 사용한 PDF 내용 챗봇

- PDF 내용을 파싱하여 텍스트 내용을 읽어서 답변해 줄 챗봇이 필요

## 🦿 사용 기능

1. pdf-parse
2. Qdrant
3. Ollama

## 사용방법

1. docker-compose up을 사용하여 Ollama & Qdrant 설치 및 실행
2. Ollama model downolad
3. npm install
4. npm run start:dev
5. api 실행

- localhost:3000/pdf/parse/upload(PDF 파일 Qdrant 저장 API)
- localhost:3000/ollama?question=질문(질문 API)

### velog 참고

- https://velog.io/@minjae98/Ollama-embed
