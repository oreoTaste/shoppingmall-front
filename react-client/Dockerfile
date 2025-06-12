# 스테이지 1: React 앱 빌드
FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# React 앱 빌드
RUN npm run build

# 스테이지 2: Nginx로 정적 파일 서비스
FROM nginx:stable-alpine

# 빌드 스테이지에서 생성된 정적 파일을 Nginx의 기본 경로로 복사
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# 위에서 작성한 Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx가 사용할 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]