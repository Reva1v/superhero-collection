// src/middleware/upload.ts
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/superheroes';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
        }
    },
});

export const processAndSaveImage = async (file: Express.Multer.File, heroId: number): Promise<string> => {
    const filename = `hero-${heroId}-${Date.now()}.webp`;
    const filepath = path.join(uploadDir, filename);

    await sharp(file.buffer)
        .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(filepath);

    return `/uploads/superheroes/${filename}`;
};
