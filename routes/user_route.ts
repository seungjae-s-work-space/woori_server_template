// routes/auth_route.ts

import { Router } from 'express';
import { UserController } from '../controller/user_controller.js';

const router = Router();
const userController = new UserController();

router.get('/get-user' ,userController.getUser.bind(UserController));

export default router;
