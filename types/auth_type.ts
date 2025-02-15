// types/auth_type.ts

// 회원가입용 데이터 구조
export interface CreateUserDto {
    email: string;
    password: string;
    // 필요한 다른 필드가 있다면 여기에 추가
    // 예: name?: string;
  }
  
  // 로그인용 데이터 구조
  export interface LoginDto {
    email: string;
    password: string;
  }
  