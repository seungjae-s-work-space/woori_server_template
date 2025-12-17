// types/auth_type.ts

// 회원가입용 데이터 구조
export interface CreateUserDto {
  password: string;
  nickname: string;
}

// 로그인용 데이터 구조
export interface LoginDto {
  nickname: string;
  password: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface TokenPayload {
  userId: string;
  nickname: string;
  exp: number;
}
