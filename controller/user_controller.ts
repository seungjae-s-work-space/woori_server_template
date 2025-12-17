// controller/auth_controller.ts

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { CreateUserDto, LoginDto } from '../types/auth_type.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

import { AuthRequest, TokenPayload } from "../types/auth_type.js";
import { CheckPasswordDto, UpdateUserDto } from "../types/user_type.js";


export class UserController {
    // 회원가입
    // 로그인
    async getUser(req: Request, res: Response) {
        try {
            console.log("🔑 토큰 확인");
            console.log(req.headers.authorization);
            const token = req.headers.authorization?.split(' ')[1]; // 헤더에서 토큰 꺼내서 가져옴

            if (!token) {
                res.status(400).json({
                    message: 'Fail',
                    errorCode: 'errorCode_auth008'
                });
                return;
            }

            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

            const user = await prisma.user.findFirst({
                where: {
                    id: decodedToken.userId,
                },
                select: {
                    nickname: true,
                }
            }); // 유저 가져오기

            if (!user) {
                res.status(400).json({
                    message: 'Fail',
                    errorCode: 'errorCode_user001'
                });
                return;
            } // 이부분은 null이 들어오면 안되기 때문에 예외처리 해줘야 함

            if (decodedToken.nickname === null) {
                res.status(400).json({
                    message: 'Fail',
                    errorCode: 'errorCode_user002'
                });
                return;
            }


            const responseUser = {
                nickname: user.nickname,
            }

            console.log("📌 유저 정보:", responseUser);

            res.status(200).json({
                message: 'Success',
                data: responseUser
            });

        } catch (error) {
            console.error("❌ 에러 발생:", error);
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    message: 'Fail',
                    errorCode: 'errorCode_auth009'
                });
                return;
            }


            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }

}
