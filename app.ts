import express from "express";
import type { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth_route.js";
import userRouter from "./routes/user_route.js";
import postRouter from "./routes/post_route.js";
import exploreRouter from './routes/explore_route.js';
import inviteRouter from './routes/invite_route.js';
import commentRouter from './routes/comment_route.js';
import likeRouter from './routes/like_route.js';
import { prisma } from "./prisma.js";  // prisma 인스턴스 import

dotenv.config();
export const app = express();

prisma.$connect().then(()=> {
   console.log("Connected to DB");
   if(process.env.MODE === "test") {
       app.listen(process.env.PORT, () => {
           console.log(`Server is running on port ${process.env.PORT}`);
       })
   } else {
       app.listen(process.env.PORT, () => {
           console.log(`Server is running on port ${process.env.PORT}`);
       })
   }
});

app.set("port", process.env.PORT || 3031);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/posts", postRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/invite', inviteRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);

type CustomError = Error & { status?: number };

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
   console.log(err);

   const errorResponse = {
       message: err.message || "Internal Server Error",
       status: err.status || 500,
   }

   res.status(errorResponse.status).json(errorResponse);
});

export default app;
