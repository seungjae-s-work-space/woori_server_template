import { Router } from 'express';
import { PostController } from '../controller/post_controller.js';

const router = Router();
const postController = new PostController();

// [POST] /posts -> 글 생성
router.post('/create-post', postController.createPost.bind(postController));

// [GET] /posts -> 내 글 목록 조회
router.get('/get-post', postController.getMyPosts.bind(postController));

// [DELETE] /posts/:postId -> 글 삭제
router.delete('/delete-post', postController.deletePost.bind(postController));

export default router;




