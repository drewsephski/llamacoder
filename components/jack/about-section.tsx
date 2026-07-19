"use client";

import FadeIn from "@/components/jack/fade-in";
import AnimatedText from "@/components/jack/animated-text";
import ContactButton from "@/components/jack/contact-button";

const aboutCopy =
  "I'm Drew, an AI engineer and product builder who turns ambitious ideas into working software. I build web products, agentic systems, developer tools, and motion-led experiences from first sketch through launch.";

const decorativeImages = [
  {
    alt: "3D moon icon",
    className:
      "left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]",
    delay: 0.1,
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png",
    x: -80,
  },
  {
    alt: "3D abstract object",
    className:
      "bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]",
    delay: 0.25,
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png",
    x: -80,
  },
  {
    alt: "3D lego icon",
    className:
      "right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]",
    delay: 0.15,
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png",
    x: 80,
  },
  {
    alt: "3D abstract group",
    className:
      "bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]",
    delay: 0.3,
    src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png",
    x: 80,
  },
] as const;

export default function AboutSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-5 py-20 sm:px-8 md:px-10"
      id="about"
    >
      {decorativeImages.map(({ alt, className, delay, src, x }) => (
        <FadeIn
          className={`pointer-events-none absolute ${className}`}
          delay={delay}
          duration={0.9}
          key={src}
          x={x}
          y={0}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={alt} className="h-auto w-full" loading="lazy" src={src} />
        </FadeIn>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn>
          <h2 className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
            About me
          </h2>
        </FadeIn>
        <AnimatedText text={aboutCopy} />
        <FadeIn delay={0.1} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}
