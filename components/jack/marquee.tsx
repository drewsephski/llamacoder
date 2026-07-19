"use client";

import { useEffect, useRef, useState } from "react";

const marqueeImages = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif",
] as const;

function ExternalImage({ alt, src }: { alt: string; src: string }) {
  // The brief supplies remote GIF artwork; next/image is not used because the
  // sources are intentionally kept outside this app's image allowlist.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className="h-[270px] w-[420px] rounded-2xl object-cover"
      loading="lazy"
      src={src}
    />
  );
}

function MarqueeRow({
  images,
  offset,
  reverse,
}: {
  images: readonly string[];
  offset: number;
  reverse?: boolean;
}) {
  const translation = reverse ? -(offset - 200) : offset - 200;
  const repeatedImages = [...images, ...images, ...images];

  return (
    <div
      className="flex w-max gap-3"
      style={{
        transform: `translate3d(${translation}px, 0, 0)`,
        willChange: "transform",
      }}
    >
      {repeatedImages.map((src, index) => (
        <ExternalImage
          alt="Drew portfolio project preview"
          key={`${src}-${index}`}
          src={src}
        />
      ))}
    </div>
  );
}

export default function Marquee() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionTop =
        sectionRef.current.getBoundingClientRect().top + window.scrollY;
      setOffset(
        Math.max(0, (window.scrollY - sectionTop + window.innerHeight) * 0.3),
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="overflow-hidden bg-[#0c0c0c] pb-10 pt-24 sm:pt-32 md:pt-40"
      ref={sectionRef}
    >
      <div className="flex flex-col gap-3">
        <MarqueeRow images={marqueeImages.slice(0, 11)} offset={offset} />
        <MarqueeRow images={marqueeImages.slice(11)} offset={offset} reverse />
      </div>
    </section>
  );
}
