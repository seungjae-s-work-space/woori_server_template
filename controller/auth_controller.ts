// controller/auth_controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from '../types/auth_type.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export class AuthController {
  // 회원가입
  public async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // DTO 형태로 req.body를 받아옴
      const userData: CreateUserDto = req.body;

      // 이미 존재하는 닉네임인지 확인
      const existingNickname = await prisma.user.findUnique({
        where: { nickname: userData.nickname },
      });

      if (existingNickname) {
        // 유저닉네임이 이미 존재하면 400 에러 응답 후 함수 종료
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth005',//이미 존재하는 닉네임
        });
        return;
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 새 유저 생성
      const newUser = await prisma.user.create({
        data: {
          password: hashedPassword,
          nickname: userData.nickname
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
        where: { nickname: loginData.nickname },
      });

      if (!user) {
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth006',
        });
        return;
      }

      // 비밀번호 비교
      const isMatch = await bcrypt.compare(loginData.password, user.password);
      if (!isMatch) {
        res.status(400).json({
          message: 'Fail',
          errorCode: 'errorCode_auth007',
        });
        return;
      }
      const deletedTokens = await prisma.tokens.deleteMany({
        where: {
          userId: user.id,
          isRevoked: false
        }
      });


      console.log(`🗑️ 삭제된 토큰 개수: ${deletedTokens.count}`);


      const tokenPayload = {
        userId: user.id,
        nickname: loginData.nickname,
      }

      const expiresIn = "100d";
      const expiresAt = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn }
      );


      // 토큰을 DB에 저장
      const createdToken = await prisma.tokens.create({
        data: {
          token: token,
          userId: user.id,
          expiresAt: expiresAt,
          isRevoked: false
        }
      });

      console.log("📌 새 토큰 저장 완료:", createdToken.token);

      res.status(200).json({
        message: "Success",
        data: {
          token: createdToken.token,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawToken = (req as any).rawToken as string;

      // 현재 토큰만 철회
      await prisma.tokens.updateMany({
        where: { token: rawToken, isRevoked: false },
        data: { isRevoked: true },
      });

      res.status(200).json({ message: 'Logout Success' });
    } catch (err) {
      next(err);
    }
  }

}
