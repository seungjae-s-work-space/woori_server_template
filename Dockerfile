# 베이스 image
FROM node:18.20.4

# 작업 directory
WORKDIR /app

# 패키지 install
COPY package*.json ./
RUN npm install

# 앱 파일 copy
COPY . .

# 앱 실행 port
EXPOSE 3030

# control 명령어
CMD ["npm", "start"]
