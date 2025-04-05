import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';
import { CreateInviteDto, InviteListResponseDto, InviteLinkResponseDto } from '../types/invite_type.js';
import crypto from 'crypto';

export class InviteController {

    // 내가 초대한 사람 목록
    public async getInvitesFromMe(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) 페이지네이션 파라미터
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // 3) 초대 목록 조회
            const [invites, totalCount] = await Promise.all([
                prisma.invite.findMany({
                    skip,
                    take: limit,
                    where: { fromUserId: userId },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        fromUser: {
                            select: {
                                id: true,
                                nickname: true,
                                email: true
                            }
                        },
                        toUser: {
                            select: {
                                id: true,
                                nickname: true,
                                email: true
                            }
                        }
                    }
                }),
                prisma.invite.count({
                    where: { fromUserId: userId }
                })
            ]);

            const response: InviteListResponseDto = {
                invites,
                totalCount
            };

            res.status(200).json({
                message: 'Success',
                data: response
            });
        } catch (error: any) {
            console.error('getInvitesFromMe error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }

    // 나를 초대한 사람 목록
    public async getInvitesToMe(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) 페이지네이션 파라미터
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // 3) 초대 목록 조회
            const [invites, totalCount] = await Promise.all([
                prisma.invite.findMany({
                    skip,
                    take: limit,
                    where: { toUserId: userId },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        fromUser: {
                            select: {
                                id: true,
                                nickname: true,
                                email: true
                            }
                        },
                        toUser: {
                            select: {
                                id: true,
                                nickname: true,
                                email: true
                            }
                        }
                    }
                }),
                prisma.invite.count({
                    where: { toUserId: userId }
                })
            ]);

            const response: InviteListResponseDto = {
                invites,
                totalCount
            };

            res.status(200).json({
                message: 'Success',
                data: response
            });
        } catch (error: any) {
            console.error('getInvitesToMe error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }

    // 초대 삭제
    public async deleteInvite(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) inviteId 파라미터
            const { inviteId } = req.params;
            if (!inviteId) {
                res.status(400).json({ message: 'inviteId is required' });
                return;
            }

            // 3) 초대 기록 확인 및 삭제
            const invite = await prisma.invite.findFirst({
                where: {
                    id: inviteId,
                    fromUserId: userId // 내가 초대한 것만 삭제 가능
                }
            });

            if (!invite) {
                res.status(404).json({ message: 'Invite not found or not authorized' });
                return;
            }

            await prisma.invite.delete({
                where: { id: inviteId }
            });

            res.status(200).json({
                message: 'Success'
            });
        } catch (error: any) {
            console.error('deleteInvite error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }

    // 초대 코드 생성
    public async createInviteCode(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 fromUserId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const fromUserId = decoded.userId;

            // 2) 초대 코드 생성 (6자리 랜덤 문자열)
            const code = crypto.randomBytes(3).toString('hex').toUpperCase();

            // 3) 초대 코드 저장 (7일 후 만료)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const inviteCode = await prisma.inviteCode.create({
                data: {
                    code,
                    fromUserId,
                    toUserId: null,
                    expiresAt
                }
            });
            console.log('🔑 초대 코드 생성:', {
                code: inviteCode.code,
                expiresAt: inviteCode.expiresAt
            });
            res.status(201).json({
                message: 'Success',
                data: {
                    code: inviteCode.code,
                    expiresAt: inviteCode.expiresAt
                }
            });
        } catch (error: any) {
            console.error('createInviteCode error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }

    // 초대 코드 수락
    public async acceptInviteCode(req: Request, res: Response): Promise<void> {
        try {
            console.log('📝 초대 코드 수락 요청:', {
                query: req.query,
                code: req.query.code,
                codeType: typeof req.query.code
            });

            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) 초대 코드 파라미터
            const { code } = req.query;
            if (!code || typeof code !== 'string') {
                res.status(400).json({ message: 'Invite code is required' });
                return;
            }

            // 3) 초대 코드 조회 및 검증
            const inviteCode = await prisma.inviteCode.findFirst({
                where: {
                    code,
                    toUserId: null,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (!inviteCode) {
                res.status(404).json({ message: 'Invalid or expired invite code' });
                return;
            }

            // 4) 초대 코드 업데이트
            await prisma.inviteCode.update({
                where: { id: inviteCode.id },
                data: { toUserId: userId }
            });

            // 5) Invite 레코드 생성
            await prisma.invite.create({
                data: {
                    fromUserId: inviteCode.fromUserId,
                    toUserId: userId
                }
            });

            res.status(200).json({
                message: 'Success'
            });
        } catch (error: any) {
            console.error('acceptInviteCode error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }
}
