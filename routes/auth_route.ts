// routes/auth_route.ts

import { Router } from 'express';
import { AuthController } from '../controller/auth_controller.js';
import { validationSignUp } from "../middleware/auth_validation.js";

const router = Router();
const authController = new AuthController();

router.post('/signup',validationSignUp ,authController.signUp.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;
