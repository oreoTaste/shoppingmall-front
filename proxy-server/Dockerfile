# 베이스 이미지로 Node.js 18-alpine 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 서버가 실행될 포트 노출
EXPOSE 5000

# 서버 실행 명령어
CMD [ "node", "server.js" ]