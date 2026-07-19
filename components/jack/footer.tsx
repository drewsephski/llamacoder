const footerLinks = [
  ["About", "#about"],
  ["Services", "#services"],
  ["Projects", "#projects"],
  ["Back to top", "#home"],
] as const;

export default function JackFooter() {
  return (
    <footer
      className="relative overflow-hidden bg-[#0c0c0c] px-6 pb-8 pt-10 text-[#d7e2ea] sm:px-8 sm:pb-10 md:px-10 md:pt-14"
      id="contact"
    >

      <div className="grid gap-10 py-20 sm:py-24 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-28">
        <div>
          <p className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#d7e2ea]/60 sm:text-xs">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#b600a8] shadow-[0_0_18px_#b600a8]"
            />
            Available for the right project
          </p>
          <h2 className="hero-heading max-w-5xl text-[clamp(3.75rem,11vw,150px)] font-black uppercase leading-[0.78] tracking-[-0.055em]">
            Let&apos;s build
            <br />
            what&apos;s next.
          </h2>
        </div>

        <a
          className="inline-flex w-fit items-center gap-4 rounded-full border border-[#d7e2ea]/50 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 hover:bg-[#d7e2ea] hover:text-[#0c0c0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7e2ea] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c0c0c] sm:px-8 sm:py-4 sm:text-sm"
          href="https://drewsepeczi.xyz"
        >
          Start a project
          <span aria-hidden="true">↗</span>
        </a>
      </div>


      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[#d7e2ea]/25 pt-16 text-xs font-medium uppercase tracking-[0.14em] sm:text-sm md:text-lg"
      >
        {footerLinks.map(([label, href]) => (
          <a
            className="transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7e2ea] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c0c0c]"
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>
            <div className="flex flex-col gap-4 pt-6 text-[10px] font-medium uppercase tracking-[0.14em] text-[#d7e2ea]/55 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <p>© 2026 Drew Sepeczi</p>
        <div className="flex gap-6">
          <a
            className="transition-colors hover:text-[#d7e2ea]"
            href="https://github.com/drewsephski"
            rel="noreferrer"
            target="_blank"
          >
            GitHub ↗
          </a>
          <a
            className="transition-colors hover:text-[#d7e2ea]"
            href="https://www.instagram.com/drew.sepeczi"
            rel="noreferrer"
            target="_blank"
          >
            Instagram ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
