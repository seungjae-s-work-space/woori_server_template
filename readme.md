 필요한 라이브러리 설치
서버 구동: Express
DB 연동: Prisma / @prisma/client
비밀번호 해시: bcrypt
JWT 토큰: jsonwebtoken

# blueberry_order_server
# 프로젝트 설정 가이드

## 1. 저장소 복제 및 환경 설정

### 저장소 복제
```bash
git pull
```

### 패키지 설치
```bash
npm install
```

### prisma/schema.prisma 파일 수정
```bash
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // DATABASE_LOCAL_URL을 DATABASE_URL로 수정
}
```


### 환경 변수 설정
`.env` 파일을 요청하세요.


## 2. Docker 컨테이너 실행

아래 명령어를 실행하여 프로젝트를 빌드 및 실행합니다.
```bash
docker-compose up --build
```

## 3. 문제 발생 시 해결 방법

문제가 발생할 경우 아래 단계를 따라 초기화 및 재시작합니다.

```bash
# 기존 데이터 제거
#로컬에서만!!!!!!!!!!!!!!
rm -rf ./postgres_data #로컬에서만!!!!!!!!!!!!!!
#로컬에서만!!!!!!!!!!!!!!

docker-compose down -v
docker-compose up --build
```



## 4. 데이터 확인 원할 시
프리즈마 스키마 원래대로 재수정 후 docker-compose up
```bash
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_LOCAL_URL")
}
```

```bash
# 기존 데이터 제거
docker-compose down -v
docker-compose up
```
<!-- 
## 5. 테스트코드 확인 시
```bash
docker-compose down -v
npx prisma generate
npx prisma migrate deploy
``` -->


<!-- 
## 5. 스키마 수정 시
```bash
nodemodule지우고 npm install
``` -->

```bash
npx prisma studio
```


이 단계를 통해 PostgreSQL 데이터가 초기화되며, 컨테이너가 새롭게 빌드됩니다.

---

이제 프로젝트 환경이 설정되었습니다. 문제가 발생하면 위의 절차를 다시 확인하세요.

