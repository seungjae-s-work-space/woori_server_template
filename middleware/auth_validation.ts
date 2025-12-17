import { Request, Response, NextFunction } from "express";


export const validationSignUp = (req: Request, res: Response, next: NextFunction): void => {
    const { password, nickname } = req.body;

    // 닉네임, 비밀번호 필수 검증
    if (!password || !nickname) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth003" });
        return;
    }

    // 비밀번호 길이 검증
    if (password.length < 4) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth002" });
        return;
    }

    // 닉네임 길이 검증 (2-20자)
    if (nickname.length < 2 || nickname.length > 20) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth010" });
        return;
    }

    next();
};
