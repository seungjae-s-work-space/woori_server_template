import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 클라이언트 설정
export const r2Client = new S3Client({
    region: 'auto', // Cloudflare R2는 'auto' 사용
    endpoint: process.env.R2_ENDPOINT, // https://your-account-id.r2.cloudflarestorage.com
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

/**
 * R2에 파일 업로드
 * @param file - 업로드할 파일 버퍼
 * @param fileName - 저장될 파일명
 * @param contentType - 파일 MIME 타입
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadToR2(
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    const bucketName = process.env.R2_BUCKET_NAME!;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file,
        ContentType: contentType,
    });

    await r2Client.send(command);

    // R2 공개 URL 반환 (Custom Domain 또는 R2.dev 도메인)
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return publicUrl;
}
