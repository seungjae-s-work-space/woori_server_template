import { Router } from 'express';
import { InviteController } from '../controller/invite_controller.js';

const router = Router();
const inviteController = new InviteController();

// 초대 생성
router.post('/', inviteController.createInvite);

// 초대 링크 생성
router.post('/invite-link', inviteController.createInviteLink);

// 초대 코드 수락
router.get('/accept', inviteController.acceptInvite);

// 내가 초대한 사람 목록
router.get('/from-me', inviteController.getInvitesFromMe);

// 나를 초대한 사람 목록
router.get('/to-me', inviteController.getInvitesToMe);

// 초대 삭제
router.delete('/:inviteId', inviteController.deleteInvite);

export default router;
