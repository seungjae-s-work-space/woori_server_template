import multer from 'multer';

// R2 업로드를 위해 메모리 스토리지 사용 (디스크에 저장하지 않음)
const storage = multer.memoryStorage();

// 파일 필터 (이미지만 허용)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('📋 파일 정보:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
    });

    // mimetype을 주로 체크 (압축된 이미지는 파일명에 확장자가 없을 수 있음)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('✅ 파일 허용됨');
        cb(null, true);
    } else {
        console.log('❌ 파일 거부됨 - mimetype:', file.mimetype);
        cb(new Error('이미지 파일만 업로드 가능합니다 (jpeg, jpg, png, gif, webp)'));
    }
};

// Multer 미들웨어 설정
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
    fileFilter: fileFilter,
});
