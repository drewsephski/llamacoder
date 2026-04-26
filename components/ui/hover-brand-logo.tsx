import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const BrandLogo = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} className={className} />
);

const brands = [
  { 
    id: 'openai',   
    name: 'OpenAI', 
    logo: 'https://svgl.app/library/openai.svg',
    logoDark: 'https://svgl.app/library/openai_dark.svg'
  },
  { 
    id: 'vercel',   
    name: 'Vercel',     
    logo: 'https://svgl.app/library/vercel.svg',
    logoDark: 'https://svgl.app/library/vercel_dark.svg'
  },
  { 
    id: 'nextjs',      
    name: 'Next.js',    
    logo: 'https://svgl.app/library/nextjs_icon_dark.svg',
    logoDark: 'https://svgl.app/library/nextjs_icon_dark.svg'
  },
  { 
    id: 'react',   
    name: 'React',    
    logo: 'https://svgl.app/library/react_light.svg',
    logoDark: 'https://svgl.app/library/react_dark.svg'
  },
  { 
    id: 'supabase', 
    name: 'Supabase', 
    logo: 'https://svgl.app/library/supabase.svg',
    logoDark: 'https://svgl.app/library/supabase.svg'
  },
  { 
    id: 'clerk',   
    name: 'Clerk',       
    logo: 'https://svgl.app/library/clerk-icon-light.svg',
    logoDark: 'https://svgl.app/library/clerk-icon-dark.svg'
  },
  { 
    id: 'stripe',      
    name: 'Stripe',      
    logo: 'https://svgl.app/library/stripe.svg',
    logoDark: 'https://svgl.app/library/stripe.svg'
  },
];

export default function HoverBrandLogo() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeBrand = brands.find(b => b.id === hoveredId);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 rounded-2xl bg-muted/50 dark:bg-muted/30 backdrop-blur-sm">
      {/* Left: text */}
      <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-left min-w-[200px]">
        <p className="text-sm sm:text-base text-muted-foreground font-medium mb-0 tracking-tight">
          Powered by
        </p>
        <div className="relative min-h-[2.5rem]">
          <p
            aria-hidden
            className="text-3xl lg:text-3xl font-bold tracking-tight whitespace-nowrap opacity-0 pointer-events-none select-none leading-none sm:leading-tight"
          >
            powerful features
          </p>
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={hoveredId ?? 'default'}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-none sm:leading-tight tracking-tight whitespace-nowrap"
              >
                {activeBrand?.name ?? 'modern tech'}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right: icon grid */}
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto md:mt-6 sm:mt-0">
        {brands.map(({ id, name, logo, logoDark }) => {
          const isActive = hoveredId === id;
          const isDimmed = hoveredId !== null && !isActive;
          return (
            <button
              key={id}
              aria-label={name}
              className={[
                'flex items-center justify-center p-2.5 sm:p-3 lg:p-3.5 rounded-lg border transition-all duration-200',
                isActive
                  ? 'border-foreground/30 text-foreground bg-foreground/5 dark:border-white/50 dark:bg-white/20 dark:shadow-[0_0_8px_rgba(255,255,255,0.25)]'
                  : 'border-transparent text-foreground/30 hover:text-foreground/50 dark:text-muted-foreground dark:hover:text-foreground dark:bg-muted/30 dark:hover:bg-muted/50 dark:hover:border-border',
                isDimmed ? 'opacity-40 ' : '',
              ].join(' ')}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <BrandLogo 
                src={logo} 
                alt={name} 
                className="w-8 h-8 sm:w-6 sm:h-6 dark:hidden" 
              />
              <BrandLogo 
                src={logoDark} 
                alt={name} 
                className="w-8 h-8 sm:w-6 sm:h-6 hidden dark:block" 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
