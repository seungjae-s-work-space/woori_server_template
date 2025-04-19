import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export interface AuthRequest extends Request {
  user?: { id: string; nickname: string };
  rawToken?: string;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Fail', errorCode: 'errorCode_auth008' });
    return;
  }

  const rawToken = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET!) as {
      userId: string;
      nickname: string;
      exp: number;
    };

    // DB‑토큰 조회
    const saved = await prisma.tokens.findFirst({  // ✔ unique 조건 안 써도 됨
      where: { token: rawToken },
    });

    // ① 존재 X ② 만료 ③ 철회 → 401
    if (
      !saved ||
      saved.isRevoked ||
      saved.expiresAt < new Date()
    ) {
      res.status(401).json({ message: 'Fail', errorCode: 'errorCode_auth009' });
      return;
    }

    // 최근 사용 시각 업데이트
    await prisma.tokens.update({
      where: { id: saved.id },
      data: { lastUsedAt: new Date() },
    });

    req.user = { id: decoded.userId, nickname: decoded.nickname };
    req.rawToken = rawToken;

    next();
  } catch {
    res.status(401).json({ message: 'Fail', errorCode: 'errorCode_auth010' });
    return;
  }
};
