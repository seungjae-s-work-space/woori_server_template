import { Router } from 'express';
import { AuthController } from '../controller/auth_controller.js';
import { validationSignUp } from '../middleware/auth_validation.js';
import { verifyToken } from '../middleware/auth_verify.js';

const router = Router();
const authController = new AuthController();

router.post('/signup', validationSignUp, authController.signUp.bind(authController));
router.post('/login',  authController.login.bind(authController));
router.post('/logout', verifyToken, authController.logout.bind(authController));

export default router;
