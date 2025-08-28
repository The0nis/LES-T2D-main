import multer from 'multer';
import path from 'path';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];

const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    if (file.fieldname !== 'music' && file.fieldname !== 'image') {
      cb(new Error('Invalid file type!'), '../uploads');
    }
    // Set the destination path for image uploads
    cb(null, path.join(__dirname, `../uploads/${file.fieldname}`));
  },
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Create a unique file name with a timestamp and random number
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Define the fileFilter to allow only images (JPEG, PNG)
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.fieldname === 'image') {
    // Check the file type
    if (ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only JPEG and PNG images are allowed!')); // Reject file
    }
  } else if (file.fieldname === 'music') {
    // Check the file type
    if (ACCEPTED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only MP3 audio files are allowed!')); // Reject file
    }
  } else {
    cb(new Error('Invalid file type!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000,
  },
  fileFilter: fileFilter,
});
