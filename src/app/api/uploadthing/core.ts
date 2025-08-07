import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Upload error:", err.message);
    console.log("  - Above error caused by:", err.cause);
    console.log("  - Above error stack:", err.stack);
    return { message: err.message };
  },
});

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      console.log("Upload middleware running");
      
      // Return some metadata to be stored with the file
      return { uploadedBy: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.uploadedBy);
      console.log("file url", file.ufsUrl || file.url); // Use ufsUrl with fallback
      
      // Return data to the client
      return { uploadedBy: metadata.uploadedBy };
    }),
  taskUploader: f({ 
    image: { maxFileSize: "2MB" },
    pdf: { maxFileSize: "2MB" }
  })
    .middleware(async ({ req }) => {
      console.log("Task upload middleware running");
      return { uploadedBy: "student" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Task upload complete for:", metadata.uploadedBy);
      console.log("Task file url:", file.ufsUrl || file.url); // Use ufsUrl with fallback
      return { uploadedBy: metadata.uploadedBy };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
