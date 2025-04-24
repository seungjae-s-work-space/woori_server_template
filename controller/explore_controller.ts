import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { ExploreResponseDto } from '../types/explore_type.js';
import jwt from 'jsonwebtoken';

export class ExploreController {
    public async getExplorePosts(req: Request, res: Response): Promise<void> {
        try {
            // 1) 토큰에서 myId 추출
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const myId = decoded.userId;

            // 2) 페이지네이션 파라미터
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // 3) 나를 초대한 fromUserId 목록
            const inviteRecords = await prisma.invite.findMany({
                where: { toUserId: myId },
                select: { fromUserId: true },
            });
            const fromUserIds = inviteRecords.map((i) => i.fromUserId);

            // 4) 나를 초대한 사람의 게시글만 조회
            const totalCount = await prisma.post.count({
                where: { userId: { in: fromUserIds } },
            });

            const posts = await prisma.post.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                where: {
                    userId: { in: fromUserIds },
                },
                select: {
                    id: true,
                    userId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            nickname: true,
                        },
                    },
                },
            });

            // 5) 응답
            const totalPages = Math.ceil(totalCount / limit);

            const response = {
                posts,
                totalCount,
                currentPage: page,
                totalPages,
            };

            // console.log('📝 초대한 사람들의 게시글:', response);

            res.status(200).json({
                message: 'Success',
                data: response
            });
        } catch (error: any) {
            console.error('getExplorePosts error:', {
                error: error,
                errorName: error?.name,
                errorMessage: error?.message,
                errorStack: error?.stack
            });
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001'
            });
        }
    }
}
