// controller/auth_controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from '../types/auth_type.js';
import jwt from 'jsonwebtoken';
import {prisma} from '../prisma.js';

export class AuthController {
  // 회원가입
  public async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // DTO 형태로 req.body를 받아옴
      const userData: CreateUserDto = req.body;

      // 이미 존재하는 이메일인지 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // 유저가 이미 존재하면 400 에러 응답 후 함수 종료
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth004',
        });
        return;
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 새 유저 생성
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      res.status(201).json({
        message: 'Sign Up Success',
        userId: newUser.id,
      });
    } catch (error) {
      // 에러 처리 미들웨어로 전달
      next(error);
    }
  }

  // 로그인
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: LoginDto = req.body;

      // 유저 조회
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
      });

      if (!user) {
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth002',
        });
        return;
      }

      // 비밀번호 비교
      const isMatch = await bcrypt.compare(loginData.password, user.password);
      if (!isMatch) {
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth003',
        });
        return;
      }

      // JWT 토큰 발급
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET ?? 'MY_JWT_SECRET', // .env에서 가져오거나 임시로 문자열 작성
        { expiresIn: '1d' },
      );

      res.status(200).json({
        message: 'Login Success',
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}
