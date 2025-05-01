// src/routes/like_routes.ts
import { Router } from 'express';
import { LikeController } from '../controller/like_controller.js';

const router = Router();
const likeController = new LikeController();

router.post('/toggle', likeController.toggleLike);
router.get('/post/:postId', likeController.getLikesByPostId);

export default router;
