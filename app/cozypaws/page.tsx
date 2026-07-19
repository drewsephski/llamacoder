import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Plus,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CozyPaws — Everything Your Pets Love",
  description: "Discover cozy essentials and happy-making products for your pets.",
};

const assets = {
  logo:
    "https://polo-pecan-73837341.figma.site/_assets/v11/0ae29d6d9628bede667f90d57bebe81b8f1ec2bf.svg",
  avatar:
    "https://polo-pecan-73837341.figma.site/_assets/v11/e62173d41f91350a59628e8a9a55ae078a886fb9.png?w=128",
  product:
    "https://polo-pecan-73837341.figma.site/_assets/v11/3e5158dad63d392ade022e81890edc9f54d750bc.png",
  video:
    "https://polo-pecan-73837341.figma.site/_assets/v11/76be6ec3a93a703b15e9cc01e764a4e3f9d7d2c0.png",
  leftPhoto:
    "https://polo-pecan-73837341.figma.site/_assets/v11/8d44b25186ef45a5789c74668fb781cea4e1ff49.png",
  centerPhoto:
    "https://polo-pecan-73837341.figma.site/_assets/v11/96745c4e72ad5c5208e53a885df797fd82cd854a.png?h=1024",
  rightPhoto:
    "https://polo-pecan-73837341.figma.site/_assets/v11/81bd2e7a66b58f3d8f3ad78fd1ebf01af8dfdee1.png",
} as const;

const navigation = [
  ["Home", "#home"],
  ["Shop", "#shop"],
  ["Delivery and payment", "#delivery"],
  ["Brands", "#brands"],
  ["Blog", "#blog"],
] as const;

function ExternalImage({
  alt,
  className,
  src,
}: {
  alt: string;
  className?: string;
  src: string;
}) {
  return (
    // The source artwork is intentionally hosted by the supplied design reference.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} src={src} />
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#EFFDF0] bg-[#E86A10] text-[10px] font-semibold leading-none text-white">
      {children}
    </span>
  );
}

function ActionButton({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <a
      aria-label={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[#1a3d1a]/35 text-[#1a3d1a] transition-colors hover:border-[#2a5a2a] hover:bg-[#1a3d1a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFFDF0] ${className}`}
      href="#shop"
    >
      {children}
    </a>
  );
}

function Header() {
  return (
    <header className="cozypaws-header relative z-30 flex shrink-0 items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-12">
      <a
        aria-label="CozyPaws home"
        className="animate-fade-in block shrink-0 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10]"
        href="https://squidagent.app"
      >
        <ExternalImage
          alt="CozyPaws"
          className="h-[33px] w-[130px] object-contain sm:h-10 sm:w-40 lg:h-[52px] lg:w-[205px]"
          src={assets.logo}
        />
      </a>

      <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
        {navigation.map(([label, href], index) => (
          <a
            className={`animate-fade-in text-sm font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10] ${index === 0 ? "text-gray-900" : "text-gray-600 hover:text-[#1a3d1a]"}`}
            href={href}
            key={label}
            style={{ animationDelay: `${150 + index * 50}ms` }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="animate-fade-in flex items-center gap-2 sm:gap-3" style={{ animationDelay: "250ms" }}>
        <ActionButton className="hidden sm:flex" label="Search CozyPaws">
          <Search aria-hidden="true" size={17} strokeWidth={1.8} />
        </ActionButton>
        <a
          aria-label="View favorite products, 4 items"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#E86A10] text-white transition-colors hover:bg-[#d45e0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFFDF0]"
          href="#shop"
        >
          <Star aria-hidden="true" fill="currentColor" size={17} strokeWidth={1.8} />
          <Badge>4</Badge>
        </a>
        <a
          aria-label="View shopping cart, 1 item"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#1a3d1a]/35 text-[#1a3d1a] transition-colors hover:border-[#2a5a2a] hover:bg-[#1a3d1a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFFDF0]"
          href="#shop"
        >
          <ShoppingCart aria-hidden="true" size={17} strokeWidth={1.8} />
          <Badge>1</Badge>
        </a>
        <ExternalImage
          alt="Your CozyPaws profile"
          className="h-10 w-10 rounded-full object-cover"
          src={assets.avatar}
        />
      </div>
    </header>
  );
}

function ProductCard() {
  return (
    <a
      className="cozypaws-product-card group absolute left-4 top-20 z-20 animate-slide-in-left md:left-4 md:top-20 lg:left-12 lg:top-[50px]"
      href="#shop"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <ExternalImage
          alt="A cozy cat house"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={assets.product}
        />
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1a3d1a] text-white transition-colors group-hover:bg-[#2a5a2a]">
          <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-3 text-left">
        <p className="text-[clamp(12px,1.05vw,16px)] text-gray-700">Cozy Cat House</p>
        <p className="text-[clamp(14px,1.2vw,18px)] font-semibold text-[#1a3d1a]">$49.99</p>
      </div>
    </a>
  );
}

function VideoCard() {
  return (
    <a
      className="cozypaws-video-card group absolute right-4 top-20 z-20 animate-slide-in-right md:right-4 md:top-20 lg:right-12 lg:top-[50px]"
      href="#reviews"
    >
      <div className="relative aspect-[177/287] overflow-hidden rounded-2xl">
        <ExternalImage
          alt="Pet product review video"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={assets.video}
        />
        <span className="absolute bottom-4 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#1a3d1a] text-white transition-colors group-hover:bg-[#2a5a2a]">
          <Play aria-hidden="true" fill="currentColor" size={16} strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-3 max-w-[177px] text-left text-[clamp(11px,0.9vw,14px)] leading-snug text-gray-700">
        Watch Product Reviews on TikTok and YouTube
      </p>
    </a>
  );
}

function HeroHeading({ mobile = false }: { mobile?: boolean }) {
  return (
    <h1
      className={`${mobile ? "text-[36px] leading-[0.98]" : "text-[clamp(60px,7.5vw,110px)] leading-[0.95]"} font-serif-display text-center tracking-tight text-[#1a3d1a]`}
      id={mobile ? undefined : "cozypaws-hero-title"}
    >
      <span className="animate-word-pop inline-block">Everything</span>
      <span className="block">
        <span className="animate-word-pop inline-block delay-300">Your</span>{" "}
        <span className="animate-word-pop inline-block delay-400">Pets</span>{" "}
        <span className="animate-word-pop inline-block delay-500">Love</span>
      </span>
    </h1>
  );
}

function AvatarStack() {
  return (
    <span aria-hidden="true" className="flex -space-x-2">
      <ExternalImage alt="" className="h-7 w-7 rounded-full border-2 border-[#EFFDF0] object-cover" src={assets.avatar} />
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#EFFDF0] bg-[#1a3d1a] text-white">
        <Plus size={13} strokeWidth={2.2} />
      </span>
    </span>
  );
}

function PhotoPanels({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={`${mobile ? "h-[clamp(142px,27svh,220px)]" : "absolute bottom-0 left-0 right-0 z-10"} flex w-full items-end ${mobile ? "gap-1.5 px-2" : "gap-0"}`}
    >
      <div className={`${mobile ? "h-full" : "max-h-[min(70vh,55vw)]"} relative min-w-0 flex-1 overflow-hidden`}>
        <ExternalImage alt="Happy dog enjoying a CozyPaws product" className="h-full w-full object-cover" src={assets.leftPhoto} />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white sm:bottom-6 sm:left-6">
          <span className="text-xl font-semibold sm:text-2xl">98K+</span>
          <AvatarStack />
        </div>
      </div>
      <div className={`${mobile ? "h-full" : "max-h-[min(85vh,70vw)]"} relative min-w-0 flex-[1.265] overflow-hidden`}>
        <ExternalImage alt="Pet relaxing in a cozy home" className="h-full w-full object-cover" src={assets.centerPhoto} />
        <div className="absolute bottom-4 left-4 right-3 text-white sm:bottom-6 sm:left-6 sm:right-6">
          <h2 className="max-w-[220px] text-lg font-medium leading-tight sm:text-2xl">Best Products for Your Pet</h2>
          <a
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E86A10] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#d45e0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#E86A10] sm:mt-4 sm:px-5 sm:py-2.5 sm:text-sm"
            href="#shop"
          >
            Explore Products
            <ArrowRight aria-hidden="true" size={15} strokeWidth={2} />
          </a>
        </div>
      </div>
      <div className={`${mobile ? "h-full" : "max-h-[min(70vh,55vw)]"} relative min-w-0 flex-1 overflow-hidden`}>
        <ExternalImage alt="Happy pet ready for playtime" className="h-full w-full object-cover" src={assets.rightPhoto} />
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-white sm:bottom-6 sm:right-6">
          <span className="text-xl font-semibold sm:text-2xl">4.6</span>
          <Star aria-hidden="true" className="text-[#E86A10]" fill="currentColor" size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function DesktopHero() {
  return (
    <section aria-labelledby="cozypaws-hero-title" className="relative hidden min-h-0 flex-1 overflow-hidden md:block">
      <div className="relative z-[5] flex justify-center px-12 pt-14 md:pt-16 lg:pt-[5.4rem]">
        <HeroHeading />
      </div>
      <ProductCard />
      <VideoCard />
      <PhotoPanels />
    </section>
  );
}

function MobileHero() {
  return (
    <section aria-labelledby="cozypaws-mobile-title" className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-4 md:hidden">
      <div className="animate-fade-up flex shrink-0 flex-col items-center text-center">
        <h1 className="font-serif-display text-[36px] leading-[0.98] tracking-tight text-[#1a3d1a]" id="cozypaws-mobile-title">
          Everything Your Pets Love
        </h1>
        <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-gray-600">Thoughtfully chosen for happy pets.</p>
        <a
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E86A10] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#d45e0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86A10] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EFFDF0]"
          href="#shop"
        >
          Explore Products
          <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
        </a>
      </div>

      <div className="mt-4 flex min-h-0 shrink-0 gap-3">
        <ProductCard />
        <VideoCard />
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-[#1a3d1a]/15 pt-3 text-[#1a3d1a]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">98K+</span>
          <AvatarStack />
        </div>
        <div className="h-6 w-px bg-[#1a3d1a]/20" />
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold">4.6</span>
          <Star aria-hidden="true" className="text-[#E86A10]" fill="currentColor" size={17} strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-auto min-h-0 pt-3">
        <PhotoPanels mobile />
      </div>
    </section>
  );
}

export default function CozyPawsPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link crossOrigin="anonymous" rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <main className="cozypaws-page flex h-[100svh] min-h-[560px] w-full flex-col overflow-hidden bg-[#EFFDF0] text-[#1a3d1a]">
        <Header />
        <DesktopHero />
        <MobileHero />
      </main>
    </>
  );
}
