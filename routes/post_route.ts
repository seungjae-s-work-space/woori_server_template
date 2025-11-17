import { Router } from 'express';
import { PostController } from '../controller/post_controller.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const postController = new PostController();

// [POST] /posts/create-post -> 글 생성 (이미지 업로드 포함)
// upload.single('image') - 'image' 필드명으로 단일 파일 업로드
router.post('/create-post', upload.single('image'), postController.createPost.bind(postController));

// [GET] /posts -> 내 글 목록 조회
router.get('/get-post', postController.getMyPosts.bind(postController));

// [DELETE] /posts/:postId -> 글 삭제
router.delete('/delete-post', postController.deletePost.bind(postController));

export default router;




