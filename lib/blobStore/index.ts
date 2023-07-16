import { Blob as ManageBlob } from "@/drizzle/types";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const blobStorage = new S3Client({
  region: "auto",
  endpoint: process.env.R2_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const upload = async (
  key: string,
  {
    content,
    type,
  }: {
    content: string | Buffer | ArrayBuffer;
    type: string;
  }
) => {
  const input = {
    Body: content as unknown as Blob, // supress type error :(
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Type: type,
  };

  const command = new PutObjectCommand(input);
  await blobStorage.send(command);
};

const getUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(blobStorage, command, {
    expiresIn: 3600,
  });

  return signedUrl;
};

const bytesToMegabytes = (bytes: number): number => {
  return Math.round(bytes / 1024 / 1024);
};

const getFileUrl = (file: ManageBlob): string => {
  return `/api/blob/${file.id}/${file.name}`;
};

export { bytesToMegabytes, getFileUrl, getUrl, upload };
