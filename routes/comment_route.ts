// src/routes/comment_routes.ts
import { Router } from 'express';
import { CommentController } from '../controller/comment_controller.js';

const router = Router();
const commentController = new CommentController();

router.post('/', commentController.createComment);
router.get('/post/:postId', commentController.getCommentsByPostId);
router.delete('/:id', commentController.deleteComment);

export default router;
