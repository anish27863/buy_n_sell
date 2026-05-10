import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getSession } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  productImageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 4 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session || session.role !== 'seller') {
        throw new Error('Unauthorized');
      }
      return { userId: session.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
