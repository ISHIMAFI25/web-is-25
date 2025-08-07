// src/utils/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
// Nama yang benar adalah UploadThingError, bukan UploadthingError
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter untuk aplikasi Anda
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload selesai untuk:", file.url);
    }),
  taskUploader: f({ 
    image: { maxFileSize: "2MB" },
    pdf: { maxFileSize: "2MB" }
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Task upload selesai untuk:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Ini adalah komponen klien yang diekspor untuk digunakan di Client Component
import {
  generateReactHelpers,
} from "@uploadthing/react";
 
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
