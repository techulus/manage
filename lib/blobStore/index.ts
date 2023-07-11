import { S3Client } from "@aws-sdk/client-s3";

const blobStorage = new S3Client({
  region: "auto",
  endpoint: process.env.R2_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export { blobStorage };
