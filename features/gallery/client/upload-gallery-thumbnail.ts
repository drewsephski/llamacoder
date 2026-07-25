export async function uploadGalleryThumbnail(
  publicationId: string,
  thumbnail: Blob,
): Promise<{
  thumbnailStatus: "ready" | "failed";
  thumbnailError?: string | null;
}> {
  const formData = new FormData();
  formData.append("thumbnail", thumbnail, "thumbnail.jpg");

  const response = await fetch(
    `/api/gallery/${encodeURIComponent(publicationId)}/thumbnail`,
    {
      method: "PUT",
      body: formData,
    },
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : "Unable to upload gallery preview image";
    throw new Error(message);
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("thumbnailStatus" in body) ||
    (body.thumbnailStatus !== "ready" && body.thumbnailStatus !== "failed")
  ) {
    throw new Error("Invalid gallery preview upload response.");
  }

  return {
    thumbnailStatus: body.thumbnailStatus,
    thumbnailError:
      "thumbnailError" in body &&
      (typeof body.thumbnailError === "string" || body.thumbnailError === null)
        ? body.thumbnailError
        : null,
  };
}
