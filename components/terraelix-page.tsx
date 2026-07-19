"use client";

import {
  ArrowUpRight,
  CornerUpLeft,
  FlaskConical,
  Leaf,
  Menu,
  Search,
  ShoppingBag,
  Sun,
  X,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const BACKGROUND_IMAGE =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_110248_b62f758d-f68c-4045-a7b4-91771d6d0a0f.png&w=1280&q=85";
const AVATAR_IMAGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/ca8093996e970200cbcf8bde8744175e52da5a79.png";
const CAPSULE_IMAGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/6a7de4fbe9c9e2315040607320a9ff5e93117bf4.png";
const PRODUCT_IMAGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/50ad042b3cd48a2e120ea3ba17c8cfeaf3cc334c.png";
const ASSESSMENT_IMAGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/6736cbe6e26afa2cd7c04a91892a79f7640785b5.png";
const PANEL_PRODUCT_IMAGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/30e8f38d1f993c357a3be2721557fc899d5640fc.png";

const navigation = ["About", "Products", "Promotions", "Contact"] as const;

const wellnessCards = [
  {
    icon: FlaskConical,
    iconClassName: "bg-black text-white",
    text: "Experience our newly enhanced natural formula",
  },
  {
    icon: Leaf,
    iconClassName: "bg-emerald-800 text-white",
    text: "Pure organic ingredients sourced sustainably",
  },
  {
    icon: Droplets,
    iconClassName: "bg-cyan-800 text-white",
    text: "Advanced bioavailability for maximum absorption",
  },
  {
    icon: Sun,
    iconClassName: "bg-amber-700 text-white",
    text: "Clinically tested for daily energy & vitality",
  },
] as const;

function RemoteImage({
  alt,
  className,
  src,
  style,
}: {
  alt: string;
  className?: string;
  src: string;
  style?: CSSProperties;
}) {
  // These assets are supplied by the landing-page brief and intentionally remain remote.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} className={className} src={src} style={style} />;
}

function IconButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 lg:h-10 lg:w-10"
      type="button"
    >
      <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
    </button>
  );
}

function Word({
  children,
  delay,
  muted = false,
}: {
  children: React.ReactNode;
  delay: number;
  muted?: boolean;
}) {
  return (
    <span className="mr-[0.18em] inline-block overflow-hidden align-bottom">
      <span
        className={`terra-animate-word-reveal inline-block ${muted ? "text-white/45" : "text-white"}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </span>
    </span>
  );
}

function TerraAnimationStyles() {
  return (
    <style>{`
      @keyframes terraFadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes terraFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes terraSlideInLeft {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes terraSlideInRight {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes terraScaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes terraWordReveal {
        from { opacity: 0; transform: translateY(100%); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0); filter: blur(0); }
      }
      .terra-animate-fade-up { animation: terraFadeUp .8s cubic-bezier(.16,1,.3,1) both; }
      .terra-animate-fade-in { animation: terraFadeIn .7s cubic-bezier(.16,1,.3,1) both; }
      .terra-animate-slide-left { animation: terraSlideInLeft .8s cubic-bezier(.16,1,.3,1) both; }
      .terra-animate-slide-right { animation: terraSlideInRight .8s cubic-bezier(.16,1,.3,1) both; }
      .terra-animate-scale-in { animation: terraScaleIn 1s cubic-bezier(.16,1,.3,1) both; }
      .terra-animate-word-reveal { animation: terraWordReveal .7s cubic-bezier(.16,1,.3,1) both; }
      @media (prefers-reduced-motion: reduce) {
        .terra-animate-fade-up,
        .terra-animate-fade-in,
        .terra-animate-slide-left,
        .terra-animate-slide-right,
        .terra-animate-scale-in,
        .terra-animate-word-reveal {
          animation: none;
          filter: none;
          opacity: 1;
          transform: none;
        }
      }
    `}</style>
  );
}

export default function TerraElixPage({
  fontClassName,
}: {
  fontClassName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCard((current) => (current + 1) % wellnessCards.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main
      className={`${fontClassName} terraelix-page relative flex min-h-screen flex-col overflow-hidden bg-cover bg-center bg-no-repeat text-white`}
      style={{
        backgroundImage: `url("${BACKGROUND_IMAGE}")`,
        fontFamily: "var(--font-terra-dm-sans), sans-serif",
      }}
    >
      <TerraAnimationStyles />

      <nav className="terra-animate-fade-in relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
        <a
          className="terra-animate-slide-left text-[30px] font-medium leading-none tracking-[-0.05em] text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          href="https://squidagent.app"
          style={{ animationDelay: "0.2s" }}
        >
          TerraElix
        </a>

        <div className="hidden items-center gap-10 lg:flex">
          {navigation.map((item) => (
            <a
              className="text-lg font-medium text-white/90 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href={`#${item.toLowerCase()}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>

        <div
          className="terra-animate-slide-right flex items-center gap-0.5"
          style={{ animationDelay: "0.3s" }}
        >
          <IconButton icon={Search} label="Search" />
          <IconButton icon={ShoppingBag} label="Shopping bag" />
          <IconButton icon={CornerUpLeft} label="Returns" />
          <RemoteImage
            alt="TerraElix member"
            className="ml-1 h-8 w-8 rounded-full object-cover lg:ml-2 lg:h-10 lg:w-10"
            src={AVATAR_IMAGE}
          />
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? (
              <X aria-hidden="true" size={21} />
            ) : (
              <Menu aria-hidden="true" size={21} />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-7 bg-black/90 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute right-5 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={24} />
          </button>
          {navigation.map((item) => (
            <a
              className="text-2xl text-white transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              href={`#${item.toLowerCase()}`}
              key={item}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}

      <section
        className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-10 pt-16 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16 lg:pt-10"
        id="top"
      >
        <h1 className="max-w-[1050px] text-[48px] font-normal leading-[1.04] tracking-[-0.05em] sm:text-[80px] sm:leading-[0.9] md:text-[110px] md:leading-[0.86] lg:text-[130px] lg:leading-[0.85] xl:text-[155px] xl:leading-[0.81]">
          <span className="block">
            <Word delay={0.3}>The</Word>
            <Word delay={0.4}>Power</Word>
            <Word delay={0.5} muted>
              of
            </Word>
          </span>
          <span className="block">
            <Word delay={0.6} muted>
              Nature
            </Word>
            <Word delay={0.7} muted>
              in
            </Word>
            <Word delay={0.8}>Every</Word>
          </span>
          <span className="block">
            <Word delay={0.9}>Capsule</Word>
            <RemoteImage
              alt="TerraElix capsule"
              className="terra-animate-scale-in ml-2 hidden h-[clamp(60px,10vw,160px)] w-auto object-contain align-middle sm:inline-block lg:ml-4"
              src={CAPSULE_IMAGE}
              style={{ animationDelay: "1s" }}
            />
          </span>
        </h1>

        <div
          className="terra-animate-fade-up mt-8 flex flex-col gap-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-8 lg:mt-[75px] lg:gap-[50px]"
          style={{
            animationDelay: "0.6s",
            fontFamily: "var(--font-terra-inter), sans-serif",
          }}
        >
          <a
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-black px-6 text-base font-medium tracking-[-0.03em] text-white transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-[240px] sm:text-lg md:w-[280px] lg:h-[72px] lg:w-[310px] lg:text-2xl"
            href="#products"
          >
            Explore Now
            <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.8} />
          </a>
          <p className="max-w-[310px] text-sm leading-[1.45] tracking-[-0.03em] text-white sm:text-base lg:text-lg">
            Discover our new plant-based supplements for daily balance and clean
            energy.
          </p>
        </div>
      </section>

      <div className="relative z-10 flex justify-center lg:hidden">
        <RemoteImage
          alt="TerraElix product collection"
          className="terra-animate-scale-in -mb-[180px] w-[180%] max-w-[1296px] object-contain drop-shadow-2xl sm:-mb-[220px] sm:w-[151%]"
          src={PRODUCT_IMAGE}
          style={{ animationDelay: "0.8s" }}
        />
      </div>

      <div
        className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]"
        id="products"
      >
        <section
          className="terra-animate-fade-up relative min-h-[250px] overflow-hidden bg-[#ECEDEC] px-6 py-8 text-black sm:px-8 sm:py-10 md:min-h-[280px] lg:px-10"
          style={{ animationDelay: "0.9s" }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <p className="max-w-[350px] text-2xl leading-[1.1] tracking-[-0.05em] sm:text-[28px] lg:text-[35px]">
              Start your personalized path to natural balance
            </p>
            <a
              className="self-start text-base tracking-[-0.03em] underline decoration-black/50 underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black sm:text-lg"
              href="#assessment"
              style={{ fontFamily: "var(--font-terra-inter), sans-serif" }}
            >
              Personal Assessment
            </a>
          </div>
          <RemoteImage
            alt=""
            className="pointer-events-none absolute bottom-0 right-0 h-full mix-blend-multiply"
            src={ASSESSMENT_IMAGE}
          />
        </section>

        <section
          className="terra-animate-fade-up min-h-[230px] bg-[#FEFDF9] px-6 py-8 text-black sm:px-8 sm:py-10"
          style={{ animationDelay: "1s" }}
        >
          <div className="relative min-h-[120px]" aria-live="polite">
            {wellnessCards.map(({ icon: Icon, iconClassName, text }, index) => (
              <div
                className={`flex items-center gap-4 transition-all duration-500 ${index === activeCard ? "relative translate-y-0 opacity-100" : "absolute inset-x-0 top-0 translate-y-4 opacity-0"}`}
                key={text}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${iconClassName}`}
                >
                  <Icon aria-hidden="true" size={22} strokeWidth={1.6} />
                </span>
                <p
                  className="text-sm leading-[1.2] tracking-[-0.03em] text-black/80 sm:text-base lg:text-lg"
                  style={{ fontFamily: "var(--font-terra-inter), sans-serif" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-1.5" aria-label="Wellness highlights">
            {wellnessCards.map((card, index) => (
              <button
                aria-label={`Show highlight ${index + 1}`}
                className={`h-0.5 flex-1 rounded-full transition-colors ${index === activeCard ? "bg-black" : "bg-black/20"}`}
                key={card.text}
                onClick={() => setActiveCard(index)}
                type="button"
              />
            ))}
          </div>
        </section>

        <section
          className="terra-animate-fade-up flex min-h-[230px] items-center gap-4 bg-black px-6 py-8 sm:gap-6 sm:px-8 sm:py-10 lg:px-10"
          style={{ animationDelay: "1.1s" }}
        >
          <RemoteImage
            alt="TerraElix supplement bottle"
            className="h-[82px] w-[120px] shrink-0 object-contain sm:h-[110px] sm:w-[160px] lg:h-[142px] lg:w-[208px]"
            src={PANEL_PRODUCT_IMAGE}
          />
          <div style={{ fontFamily: "var(--font-terra-inter), sans-serif" }}>
            <p className="text-2xl tracking-[-0.05em] text-white sm:text-3xl lg:text-[35px]">
              +14K
            </p>
            <p className="mt-1 text-sm leading-[1.2] text-white/60 sm:text-base lg:text-lg">
              People have already optimized their wellness
            </p>
          </div>
        </section>
      </div>

      <RemoteImage
        alt=""
        className="terra-animate-scale-in pointer-events-none absolute bottom-[-10%] right-[clamp(-400px,-20vw,-100px)] z-0 hidden h-auto w-[clamp(600px,80vw,1412px)] lg:block"
        src={PRODUCT_IMAGE}
        style={{ animationDelay: "0.7s" }}
      />
    </main>
  );
}
