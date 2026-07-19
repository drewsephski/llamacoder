"use client";

import FadeIn from "@/components/jack/fade-in";

const services = [
  [
    "AI Engineering",
    "Production-ready AI agents, model integrations, retrieval systems, and evaluation loops built around real product workflows.",
  ],
  [
    "Product Building",
    "End-to-end product work from research and interaction design through implementation, testing, launch, and iteration.",
  ],
  [
    "Web Development",
    "Fast, accessible React and Next.js experiences with thoughtful architecture, responsive interfaces, and durable backend systems.",
  ],
  [
    "Software Engineering",
    "Maintainable applications, APIs, automation, and infrastructure designed to keep working as products and teams grow.",
  ],
  [
    "Motion & Visual Design",
    "Cinematic product stories, interface motion, launch visuals, and interactive systems that make complex ideas feel immediate.",
  ],
] as const;

export default function ServicesSection() {
  return (
    <section
      className="rounded-t-[40px] bg-white px-5 py-20 text-[#0c0c0c] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
      id="services"
    >
      <h2 className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
        Services
      </h2>
      <div className="mx-auto max-w-5xl">
        {services.map(([name, description], index) => (
          <FadeIn key={name} delay={index * 0.1} y={30}>
            <article className="grid grid-cols-[clamp(4.75rem,20vw,140px)_1fr] gap-4 border-t border-[rgba(12,12,12,0.15)] py-8 sm:grid-cols-[clamp(6rem,22vw,180px)_1fr] sm:gap-8 sm:py-10 md:grid-cols-[clamp(8rem,24vw,220px)_1fr] md:gap-10 md:py-12">
              <span className="text-[clamp(3rem,10vw,140px)] font-black leading-[0.8] tracking-tight">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase leading-tight">
                  {name}
                </h3>
                <p className="mt-3 max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">
                  {description}
                </p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
