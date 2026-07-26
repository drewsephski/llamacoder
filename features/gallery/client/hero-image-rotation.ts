export type GalleryHeroImage = {
  src: string;
  alt: string;
  title: string;
  prompt: string;
};

export function buildGalleryHeroImageDeck(
  images: readonly GalleryHeroImage[],
  previousSrc: string | null,
  random: () => number = Math.random,
) {
  const uniqueImages = [
    ...new Map(images.map((image) => [image.src, image])).values(),
  ];

  if (uniqueImages.length === 1 && uniqueImages[0]?.src === previousSrc) {
    return [];
  }

  const shuffled = [...uniqueImages];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ];
  }

  if (shuffled[0]?.src === previousSrc) {
    const swapIndex = shuffled.findIndex((image) => image.src !== previousSrc);
    if (swapIndex > 0) {
      [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[0]!];
    }
  }

  return shuffled;
}
