"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

import LiveProjectButton from "@/components/jack/live-project-button";

const projects = [
  {
    category: "Client",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
    ],
    name: "Nextlevel Studio",
  },
  {
    category: "Personal",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
    ],
    name: "Aura Brand Identity",
  },
  {
    category: "Client",
    images: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
    ],
    name: "Solaris Digital",
  },
] as const;

function ProjectCard({
  index,
  project,
}: {
  index: number;
  project: (typeof projects)[number];
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const prefersReducedMotion = useReducedMotion();
  const targetScale = 1 - (projects.length - 1 - index) * 0.045;
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.28, 1], [0.94, 1, targetScale]),
    { damping: 26, stiffness: 180 },
  );
  const y = useSpring(
    useTransform(scrollYProgress, [0, 0.28, 1], [72, 0, index * -10]),
    { damping: 28, stiffness: 170 },
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.28],
    [index % 2 === 0 ? -0.7 : 0.7, 0],
  );

  return (
    <motion.article
      className={`${index === projects.length - 1 ? "mb-0" : "mb-[18vh]"} sticky flex h-[min(76vh,700px)] origin-top flex-col overflow-hidden rounded-[40px] border-2 border-[#d7e2ea]/80 bg-[#0c0c0c] p-4 shadow-[0_-18px_60px_rgba(0,0,0,0.34)] sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8`}
      ref={cardRef}
      style={{
        rotate: prefersReducedMotion ? 0 : rotate,
        scale: prefersReducedMotion ? 1 : scale,
        top: `calc(clamp(5.5rem, 7vw, 7rem) + ${index * 18}px)`,
        y: prefersReducedMotion ? 0 : y,
        zIndex: index + 1,
      }}
    >
      <div className="flex min-h-20 items-start gap-3 sm:min-h-28 sm:gap-5">
          <span className="text-[clamp(3rem,10vw,140px)] font-black leading-[0.75] tracking-tight">
            0{index + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1 sm:pt-2">
            <p className="text-[10px] font-light uppercase tracking-widest text-[#d7e2ea]/60 sm:text-xs">
              {project.category}
            </p>
            <h3 className="mt-1 text-[clamp(1.15rem,3.4vw,3.2rem)] font-medium uppercase leading-none tracking-tight text-[#d7e2ea]">
              {project.name}
            </h3>
          </div>
          <LiveProjectButton className="mt-1 px-3 py-2 text-[9px] sm:px-8 sm:py-3 sm:text-sm" />
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-[40%_60%] gap-3 sm:mt-5">
        <div className="flex min-h-0 flex-col gap-3">
          <ProjectImage
            className="h-[clamp(130px,16vw,230px)]"
            src={project.images[0]}
          />
          <ProjectImage className="min-h-0 flex-1" src={project.images[1]} />
        </div>
        <ProjectImage className="h-full" src={project.images[2]} />
      </div>
    </motion.article>
  );
}

function ProjectImage({ className, src }: { className?: string; src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Project artwork"
      className={`w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px] ${className ?? ""}`}
      loading="lazy"
      src={src}
    />
  );
}

export default function ProjectsSection() {
  return (
    <section
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0c0c0c] px-5 pb-24 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32"
      id="projects"
    >
      <h2 className="hero-heading mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
        Selected work
      </h2>
      <div className="mx-auto max-w-6xl">
        {projects.map((project, index) => (
          <ProjectCard index={index} key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}
