import { Request, Response, NextFunction } from "express";


export const validationSignUp = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password, restaurantName, foodService, tableCount, address } = req.body;

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth001" });
        return;
    }

    if (password.length < 4) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth002" });
        return;
    }

    if (!password || !restaurantName || !foodService || !tableCount || !address) {
        res.status(400).json({ message: "Fail", errorCode: "errorCode_auth003" });
        return;
    }

    next();
};