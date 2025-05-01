import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { CreatePostDto } from '../types/post_type.js';

export class PostController {
    // [1] 게시글 생성
    public async createPost(req: Request, res: Response): Promise<void> {
        try {
            // 토큰 해석
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

            // DTO 형태로 req.body 받기
            const postData: CreatePostDto = req.body;

            // console.log('📝 요청 데이터:', {
            //     postData,
            //     body: req.body,
            //     contentType: req.headers['content-type']
            // });

            // 간단 유효성 검사
            if (!postData.content) {
                res.status(400).json({ message: 'Content is required' });
                return;
            }

            // DB에 글 생성
            const newPost = await prisma.post.create({
                data: {
                    content: postData.content,
                    userId: decoded.userId,
                },
            });

            res.status(201).json({ message: 'Success', data: newPost });
        } catch (error: any) {
            console.error('createPost error:', {
                error: error,
                errorName: error?.name,
                errorMessage: error?.message,
                errorStack: error?.stack,
                requestBody: req.body,
                headers: req.headers
            });
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_public001',
            });
        }
    }


    // [2] 내 게시글 목록 조회
// 컨트롤러 수정
public async getMyPosts(req: Request, res: Response): Promise<void> {
    try {
        // 토큰 해석
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // DB에서 userId=decoded.userId인 글 조회 (좋아요, 댓글 수 포함)
        const posts = await prisma.post.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            }
        });

        // 응답 데이터 형식 가공
        const formattedPosts = posts.map(post => ({
            id: post.id,
            userId: post.userId,
            content: post.content,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            user: post.user,
            likeCount: post._count.likes,
            commentCount: post._count.comments,
        }));

        res.status(200).json({ message: 'Success', data: formattedPosts });
    } catch (error) {
        console.error('getMyPosts error:', error);
        res.status(500).json({
            message: 'Fail', errorCode: 'errorCode_public001'
        });
    }
}
    // [3] 게시글 삭제
    public async deletePost(req: Request, res: Response): Promise<void> {
        try {
            // ① 토큰 해석
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

            // ② URL 파라미터에서 postId 가져오기
            const { postId } = req.params;
            if (!postId) {
                res.status(400).json({ message: 'postId is required' });
                return;
            }

            // ③ 해당 글이 내 글인지 확인 후 삭제
            const existing = await prisma.post.findFirst({
                where: { id: postId, userId: decoded.userId },
            });
            if (!existing) {
                res.status(404).json({ message: 'Post not found or not owned by user' });
                return;
            }

            await prisma.post.delete({ where: { id: postId } });
            res.status(200).json({ message: 'Success' });
        } catch (error) {
            console.error('deletePost error:', error);
            res.status(500).json({
                message: 'Fail', errorCode: 'errorCode_public001'
            });
        }
    }
    public async getPostById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const token = req.headers.authorization?.split(' ')[1];
            let myId = null;

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                myId = decoded.userId;
            }

            // 1) 게시물 조회
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            nickname: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    }
                }
            });

            if (!post) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            // 2) 현재 사용자가 좋아요 했는지 확인
            let isLiked = false;
            if (myId) {
                const myLike = await prisma.like.findUnique({
                    where: {
                        postId_userId: {
                            postId: id,
                            userId: myId
                        }
                    }
                });
                isLiked = !!myLike;
            }

            // 3) 응답 데이터 생성
            const response = {
                ...post,
                isLiked
            };

            res.status(200).json({
                message: 'Success',
                data: response
            });
        } catch (error: any) {
            console.error('getPostById error:', error);
            res.status(500).json({
                message: 'Fail',
                errorCode: 'errorCode_post001'
            });
        }
    }

}
