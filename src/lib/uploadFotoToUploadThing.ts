import { uploadFiles } from "./uploadthing";

export async function uploadFotoToUploadThing(file: File): Promise<string> {
  try {
    console.log('Starting upload with UploadThing...');
    
    const result = await uploadFiles("imageUploader", {
      files: [file],
    });

    console.log('Upload result:', result);

    if (result && result.length > 0) {
      // Use ufsUrl instead of deprecated url
      return result[0].ufsUrl || result[0].url;
    } else {
      throw new Error('No file URL returned from UploadThing');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}