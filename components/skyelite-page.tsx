"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const videoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4";

const navigation = ["Start", "Story", "Rates", "Benefits", "FAQ"] as const;

type SkyElitePageProps = {
  fontClassName: string;
};

export function SkyElitePage({ fontClassName }: SkyElitePageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <main className={`${fontClassName} min-h-screen bg-gray-50`}>
      <section className="relative h-screen overflow-hidden" id="start">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loop
          muted
          preload="auto"
          playsInline
          src={videoSrc}
          tabIndex={-1}
        />

        <div className="relative z-10 flex h-full flex-col">
          <nav
            aria-label="Primary navigation"
            className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6"
          >
            <a
              className="text-2xl font-semibold text-gray-900 transition-colors hover:text-gray-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2"
              href="https://squidagent.app"
              onClick={closeMenu}
            >
              SkyElite
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {navigation.map((item) => (
                <a
                  className="text-sm text-gray-900 transition-colors hover:text-gray-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2"
                  href={`#${item.toLowerCase()}`}
                  key={item}
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              aria-controls="skyelite-mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="rounded-full p-2 text-gray-900 transition-colors hover:bg-white/40 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2 md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
            >
              {isMenuOpen ? (
                <X aria-hidden="true" className="size-6" />
              ) : (
                <Menu aria-hidden="true" className="size-6" />
              )}
            </button>

            {isMenuOpen ? (
              <div
                className="absolute left-4 right-4 top-full rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur-md md:hidden"
                id="skyelite-mobile-menu"
              >
                {navigation.map((item) => (
                  <a
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50"
                    href={`#${item.toLowerCase()}`}
                    key={item}
                    onClick={closeMenu}
                  >
                    {item}
                  </a>
                ))}
              </div>
            ) : null}
          </nav>

          <div className="flex flex-1 items-center justify-center px-8 text-center">
            <div className="-mt-80 max-w-3xl">
              <p className="mb-4 text-sm font-semibold tracking-wider text-gray-600">
                PRIVATE JETS
              </p>

              <h1 className="tracking-tighter">
                <span className="block text-6xl font-normal leading-none text-gray-500 md:text-7xl lg:text-8xl">
                  Premium.
                </span>
                <span className="-mt-3 block text-6xl font-normal leading-none text-[#202A36] md:text-7xl lg:text-8xl">
                  Accessible.
                </span>
              </h1>

              <p className="mb-6 mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
                Your dedication deserves recognition.
              </p>

              <div className="flex justify-center gap-4">
                <a
                  className="rounded-full bg-gray-300 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/50 focus-visible:ring-offset-2"
                  href="#story"
                >
                  Discover
                </a>
                <a
                  className="rounded-full bg-[#202A36] px-4 py-2 font-medium text-white transition-colors hover:bg-[#1a2229] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202A36]/50 focus-visible:ring-offset-2"
                  href="#rates"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
