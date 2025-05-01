// src/controller/comment_controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import jwt from 'jsonwebtoken';

export class CommentController {
    public async createComment(req: Request, res: Response): Promise<void> {
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
            const { postId, content } = req.body;
            if (!postId || !content) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }

            // 3) 댓글 생성
            const comment = await prisma.comment.create({
                data: {
                    postId,
                    userId,
                    content
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Success',
                data: comment
            });
        } catch (error: any) {
            console.error('createComment error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_comment001'
            });
        }
    }

    public async getCommentsByPostId(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;

            const comments = await prisma.comment.findMany({
                where: { postId },
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true
                        }
                    }
                }
            });

            res.status(200).json({
                message: 'Success',
                data: comments
            });
        } catch (error: any) {
            console.error('getCommentsByPostId error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_comment002'
            });
        }
    }

    public async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 userId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const userId = decoded.userId;

            // 2) 댓글 ID 확인
            const { id } = req.params;

            // 3) 댓글 소유권 확인
            const comment = await prisma.comment.findUnique({
                where: { id }
            });

            if (!comment) {
                res.status(404).json({ message: 'Comment not found' });
                return;
            }

            if (comment.userId !== userId) {
                res.status(403).json({ message: 'Not authorized to delete this comment' });
                return;
            }

            // 4) 댓글 삭제
            await prisma.comment.delete({
                where: { id }
            });

            res.status(200).json({
                message: 'Comment deleted successfully'
            });
        } catch (error: any) {
            console.error('deleteComment error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_comment003'
            });
        }
    }
}
