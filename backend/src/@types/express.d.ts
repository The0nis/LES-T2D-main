// types/express.d.ts
export declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File; // Single file
      files?: Express.Multer.File[]; // Multiple files
    }

    interface User {
      email: string;
      id: number;
      image: string;
      gender: string | null;
      username: string | null;
      phone: string | null;
      country: string | null;
      state: string | null;
      street: string | null;
      date_of_birth: string | null;
      city: string | null;
      completionPercentage: number | null;
      checklist: unknown;
    }
  }
}
