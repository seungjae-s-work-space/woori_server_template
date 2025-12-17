import sharp from 'sharp';

interface OptimizedImage {
    buffer: Buffer;
    contentType: string;
    extension: string;
}

/**
 * 이미지 최적화 (리사이징 + WebP 변환 + 압축)
 * @param imageBuffer - 원본 이미지 버퍼
 * @param maxWidth - 최대 너비 (기본값: 1920px)
 * @param quality - 압축 품질 (기본값: 80)
 * @returns 최적화된 이미지 버퍼와 메타데이터
 */
export async function optimizeImage(
    imageBuffer: Buffer,
    maxWidth: number = 1920,
    quality: number = 80
): Promise<OptimizedImage> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // 원본 너비가 maxWidth보다 큰 경우에만 리사이징
    let pipeline = image;
    if (metadata.width && metadata.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside',
        });
    }

    // WebP로 변환 + 압축
    const optimizedBuffer = await pipeline
        .webp({ quality })
        .toBuffer();

    console.log(`🖼️ 이미지 최적화 완료: ${(imageBuffer.length / 1024).toFixed(1)}KB → ${(optimizedBuffer.length / 1024).toFixed(1)}KB (${((1 - optimizedBuffer.length / imageBuffer.length) * 100).toFixed(1)}% 감소)`);

    return {
        buffer: optimizedBuffer,
        contentType: 'image/webp',
        extension: 'webp',
    };
}
