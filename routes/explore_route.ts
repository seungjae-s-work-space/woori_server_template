import { Router } from 'express';
import { ExploreController } from '../controller/explore_controller.js';

const router = Router();
const exploreController = new ExploreController();

router.get('/', exploreController.getExplorePosts);

export default router;
