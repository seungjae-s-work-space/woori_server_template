// src/controller/like_controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';

export class LikeController {
    public async toggleLike(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) 요청 데이터 검증
            const { postId } = req.body;
            if (!postId) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            // 3) 기존 좋아요 확인
            const existingLike = await prisma.like.findUnique({
                where: {
                    postId_userId: {
                        postId,
                        userId
                    }
                }
            });

            if (existingLike) {
                // 4) 좋아요 취소
                await prisma.like.delete({
                    where: {
                        id: existingLike.id
                    }
                });

                res.status(200).json({
                    message: 'Success',
                    data: { liked: false }
                });
            } else {
                // 5) 좋아요 추가
                await prisma.like.create({
                    data: {
                        postId,
                        userId
                    }
                });

                res.status(200).json({
                    message: 'Success',
                    data: { liked: true }
                });
            }
        } catch (error: any) {
            console.error('toggleLike error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_like001'
            });
        }
    }

    public async getLikesByPostId(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const token = req.headers.authorization?.split(' ')[1];
            let myId = null;

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                myId = decoded.userId;
            }

            // 1) 해당 게시물의 좋아요 수 계산
            const likesCount = await prisma.like.count({
                where: { postId }
            });

            // 2) 현재 사용자가 좋아요 했는지 확인
            let isLiked = false;
            if (myId) {
                const myLike = await prisma.like.findUnique({
                    where: {
                        postId_userId: {
                            postId,
                            userId: myId
                        }
                    }
                });
                isLiked = !!myLike;
            }

            // 3) 좋아요 사용자 목록 가져오기 (추가됨)
            const likes = await prisma.like.findMany({
                where: { postId },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json({
                message: 'Success',
                data: {
                    count: likesCount,
                    isLiked,
                    likes // 좋아요 사용자 목록 추가
                }
            });
        } catch (error: any) {
            console.error('getLikesByPostId error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_like002'
            });
        }
    }

}
