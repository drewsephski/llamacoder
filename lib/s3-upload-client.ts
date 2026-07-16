type PresignedUploadResponse = {
  bucket: string;
  key: string;
  region: string;
  url: string;
};

function getPublicObjectUrl({ bucket, key, region }: PresignedUploadResponse) {
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function uploadScreenshot(file: File) {
  const presignResponse = await fetch("/api/s3-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      filetype: file.type,
      filesize: file.size,
      _nextS3: { strategy: "presigned" },
    }),
  });
  const presigned = (await presignResponse.json()) as
    | PresignedUploadResponse
    | { error?: string };

  if (!presignResponse.ok || !("url" in presigned)) {
    const error = "error" in presigned ? presigned.error : undefined;
    throw new Error(error || "Unable to prepare the upload.");
  }

  const uploadResponse = await fetch(presigned.url, {
    method: "PUT",
    headers: {
      "Cache-Control": "max-age=630720000, public",
      "Content-Type": file.type,
    },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Unable to upload the screenshot.");
  }

  return { url: getPublicObjectUrl(presigned) };
}
