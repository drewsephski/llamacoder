export type PastMediaKind = "video" | "image";

export interface PastMediaCatalogEntry {
  id: string;
  kind: PastMediaKind;
  url: string;
  description: string;
  mood: string;
  tags: readonly string[];
  useWhen: string;
  howToUse: string;
}

export const HARDCODED_PAST_MEDIA_CATALOG: readonly PastMediaCatalogEntry[] = [
  {
    id: "velorah-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
    description:
      "Slow cinematic loop for a poetic creative studio landing page.",
    mood: "quiet, editorial, minimal luxury",
    tags: ["studio", "portfolio", "creative", "serif", "landing"],
    useWhen:
      "The app is a creative agency, portfolio, journal, or luxury brand without its own hero media.",
    howToUse:
      "Full-viewport muted looping background video with a light scrim and centered serif headline.",
  },
  {
    id: "mindloop-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4",
    description:
      "Calm intellectual hero loop for a writer or creator platform.",
    mood: "thoughtful, calm, literary",
    tags: ["writing", "newsletter", "community", "content", "hero"],
    useWhen:
      "The product is about writing, publishing, ideas, or curated content feeds.",
    howToUse:
      "Hero background video behind a centered manifesto-style headline and primary CTA.",
  },
  {
    id: "mindloop-solution-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4",
    description:
      "Companion loop for a product solution or how-it-works section.",
    mood: "calm, explanatory, refined",
    tags: ["feature", "how-it-works", "writing", "product"],
    useWhen:
      "You need a mid-page video panel explaining workflow, not a full-screen hero.",
    howToUse:
      "Place in a split section beside copy; keep muted, looped, and contained.",
  },
  {
    id: "mindloop-mission-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4",
    description:
      "Mission or philosophy section loop from the same writer-platform family.",
    mood: "reflective, sincere, premium",
    tags: ["about", "mission", "philosophy", "community"],
    useWhen:
      "The page needs an About/Mission band with motion but not a loud hero.",
    howToUse:
      "Use beside long-form mission copy or inside a rounded media frame.",
  },
  {
    id: "skyleite-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4",
    description: "Bright premium travel/aviation hero loop.",
    mood: "light, airy, aspirational",
    tags: ["travel", "aviation", "membership", "concierge", "hero"],
    useWhen:
      "The brief implies travel, flights, premium membership, or elevated service.",
    howToUse:
      "Full-screen hero video with light UI, generous whitespace, and one primary CTA.",
  },
  {
    id: "prisma-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",
    description: "Dark cinematic hero loop for film/production tooling.",
    mood: "cinematic, dramatic, creative",
    tags: ["film", "production", "storyboard", "video", "hero"],
    useWhen:
      "The product is about film, video, storytelling, editing, or creative production.",
    howToUse:
      "Edge-to-edge hero video with high-contrast display type and dark surfaces.",
  },
  {
    id: "prisma-feature-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
    description:
      "Secondary cinematic loop for feature sections below the hero.",
    mood: "cinematic, focused, premium",
    tags: ["film", "feature", "showcase", "production"],
    useWhen:
      "You already used a cinematic hero and need a matching lower-section video.",
    howToUse:
      "Use in a feature band or split layout, not as a second full-page hero.",
  },
  {
    id: "design-rocket-roadmap-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260417_110451_9f82b157-dc92-4a9f-a341-c25594ec20e1.mp4",
    description:
      "Dark motion loop for an edtech roadmap or curriculum section.",
    mood: "dark, bold, training-focused",
    tags: ["course", "certificate", "roadmap", "edtech", "dark"],
    useWhen:
      "The product sells training, certificates, bootcamps, or AI education.",
    howToUse:
      "Pair with near-black surfaces and one acid/neon accent CTA; use in content band.",
  },
  {
    id: "design-rocket-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_064822_f120e48a-d545-45dd-a02d-facb07829888.mp4",
    description:
      "Edgy hero loop for a dark training or certificate landing page.",
    mood: "dark, energetic, high-contrast",
    tags: ["course", "certificate", "hero", "edtech", "bold"],
    useWhen:
      "You need a loud, dark landing page for learning, upskilling, or AI training.",
    howToUse:
      "Full-width hero video under nav with neon CTA and strong typographic hierarchy.",
  },
  {
    id: "design-rocket-leadership-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260419_065931_e3ca7b53-d32e-4ad5-81de-dc9d6fcfda6d.mp4",
    description:
      "Leadership or credibility section loop for the same edtech brand.",
    mood: "authoritative, dark, polished",
    tags: ["leadership", "trust", "course", "testimonial", "dark"],
    useWhen:
      "The page needs a credibility, leadership, or outcomes section with motion.",
    howToUse:
      "Place beside quotes, stats, or instructor credentials in a split layout.",
  },
  {
    id: "rivr-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4",
    description:
      "Soft SaaS hero loop inside a rounded card on a light grey canvas.",
    mood: "calm, enterprise, approachable",
    tags: ["saas", "b2b", "fintech", "rounded", "hero"],
    useWhen:
      "The product is B2B SaaS, fintech, or operations software with a friendly tone.",
    howToUse:
      "Keep video inside a rounded hero container rather than edge-to-edge full bleed.",
  },
  {
    id: "axion-studio-narrativ-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_122702_390f5305-8719-41d5-ae80-d23ab3796c28.mp4",
    description:
      "Interactive 3D showcase loop for an award-style portfolio case study.",
    mood: "experimental, premium, interactive",
    tags: ["portfolio", "case-study", "3d", "webgl", "agency"],
    useWhen:
      "The page showcases experimental web work, 3D, or award-winning portfolio pieces.",
    howToUse:
      "Use in a project card preview, case-study hero, or hover-reveal media tile.",
  },
  {
    id: "axion-studio-luminar-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_123323_f909c2b8-ff6c-4edf-882b-8ebcdbe389b5.mp4",
    description:
      "Brand transformation case-study loop for agency portfolio work.",
    mood: "confident, polished, marketing-led",
    tags: ["rebrand", "portfolio", "agency", "case-study", "conversion"],
    useWhen:
      "The brief is about rebranding, relaunch, or conversion-focused redesign work.",
    howToUse:
      "Use as a portfolio tile video or split hero for a case-study page.",
  },
  {
    id: "forma-agency-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4",
    description:
      "Agency/services background loop for a contact or studio page.",
    mood: "professional, design-led, modern",
    tags: ["agency", "studio", "services", "contact", "background"],
    useWhen:
      "The product is a design/dev agency, studio, or services business.",
    howToUse:
      "Background video for services/contact hero with form or CTA overlay.",
  },
  {
    id: "mentality-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4",
    description:
      "Tall wellness hero loop with subtle motion for coaching or mindset products.",
    mood: "grounded, wellness, spacious",
    tags: ["wellness", "coaching", "mindset", "hero", "calm"],
    useWhen:
      "The app is about wellness, coaching, mindfulness, or personal growth.",
    howToUse:
      "Use in a tall hero with soft typography; keep video subtle, not overpowering.",
  },
  {
    id: "axon-hero-video",
    kind: "video",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4",
    description:
      "Clean enterprise hero loop for automation or digital-worker products.",
    mood: "enterprise, efficient, modern",
    tags: ["automation", "agents", "workflow", "b2b", "enterprise"],
    useWhen:
      "The product automates workflows, browser tasks, or AI agent operations.",
    howToUse:
      "Video behind frosted nav and light typography on a white or off-white shell.",
  },
  {
    id: "prisma-critiques-icon",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png",
    description: "Studio-lit astronaut portrait on a dark background.",
    mood: "cinematic, sci-fi, analytical",
    tags: ["astronaut", "space", "film", "feature-icon", "dark"],
    useWhen:
      "You need a premium feature icon for critique, review, analysis, or space/film themes.",
    howToUse:
      "Use as a square feature-card image or small hero accent, not a full background.",
  },
  {
    id: "prisma-capsule-icon",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png",
    description: "Pixel-art astronaut floating in a starfield.",
    mood: "retro, playful, focused",
    tags: ["pixel-art", "astronaut", "focus", "gaming", "feature-icon"],
    useWhen:
      "The product has focus modes, deep work, immersion, or retro/indie aesthetics.",
    howToUse: "Small feature icon or empty-state illustration in a card grid.",
  },
  {
    id: "prisma-storyboard-icon",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png",
    description:
      "Astronaut seated in an ancient stone ruin under a single spotlight.",
    mood: "mysterious, cinematic, mythic",
    tags: ["storyboard", "film", "mystery", "feature-icon", "dramatic"],
    useWhen:
      "The feature is about planning, storyboarding, discovery, or narrative prep.",
    howToUse:
      "Feature-card thumbnail or mood panel beside storyboard/planning copy.",
  },
  {
    id: "jack-nextlevel-garden-a",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png",
    description: "Magical flower garden with golden bokeh and vivid blooms.",
    mood: "enchanted, lush, premium creative",
    tags: ["garden", "portfolio", "creative", "colorful", "3d-render"],
    useWhen:
      "The project is a creative studio, florist, luxury consumer, or artistic brand.",
    howToUse: "Large portfolio-card background or hero collage panel.",
  },
  {
    id: "jack-nextlevel-garden-b",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png",
    description:
      "Alternate magical garden render from the same creative portfolio set.",
    mood: "enchanted, lush, premium creative",
    tags: ["garden", "portfolio", "creative", "colorful", "3d-render"],
    useWhen:
      "You need a second garden-style portfolio image in a carousel or stacked cards.",
    howToUse:
      "Rotate with other portfolio images; do not combine multiple garden shots in one hero.",
  },
  {
    id: "jack-nextlevel-garden-c",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png",
    description:
      "Third magical garden render for creative-agency portfolio cards.",
    mood: "enchanted, lush, premium creative",
    tags: ["garden", "portfolio", "creative", "colorful", "3d-render"],
    useWhen:
      "A portfolio grid needs another lush, non-generic visual for creative work.",
    howToUse: "Use as one tile in a 3-up project gallery.",
  },
  {
    id: "jack-aura-brand-a",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png",
    description: "Abstract premium brand-identity render for portfolio cards.",
    mood: "luxury, abstract, identity-led",
    tags: ["brand", "identity", "portfolio", "luxury", "abstract"],
    useWhen:
      "The brief is about branding, identity systems, or luxury positioning.",
    howToUse: "Portfolio card header image on a dark shell.",
  },
  {
    id: "jack-aura-brand-b",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png",
    description: "Second Aura brand-identity portfolio render.",
    mood: "luxury, abstract, identity-led",
    tags: ["brand", "identity", "portfolio", "luxury", "abstract"],
    useWhen:
      "You need another identity-system visual in a stacked portfolio presentation.",
    howToUse:
      "Use in scroll-stacked project cards, not as a literal product photo.",
  },
  {
    id: "jack-aura-brand-c",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png",
    description: "Third Aura brand-identity portfolio render.",
    mood: "luxury, abstract, identity-led",
    tags: ["brand", "identity", "portfolio", "luxury", "abstract"],
    useWhen: "The page showcases brand identity or repositioning work.",
    howToUse: "Alternate with other Aura images in a carousel or card stack.",
  },
  {
    id: "jack-solaris-digital-a",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png",
    description: "Digital-agency portfolio render with tech/marketing energy.",
    mood: "modern, digital, confident",
    tags: ["agency", "digital", "portfolio", "marketing", "tech"],
    useWhen:
      "The product is a digital agency, growth studio, or marketing platform.",
    howToUse: "Portfolio card image or case-study thumbnail.",
  },
  {
    id: "jack-solaris-digital-b",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png",
    description: "Second Solaris digital-agency portfolio render.",
    mood: "modern, digital, confident",
    tags: ["agency", "digital", "portfolio", "marketing", "tech"],
    useWhen:
      "You need a second agency-style portfolio visual in the same presentation.",
    howToUse: "Use in a project stack or marquee, one image at a time.",
  },
  {
    id: "jack-solaris-digital-c",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png",
    description: "Third Solaris digital-agency portfolio render.",
    mood: "modern, digital, confident",
    tags: ["agency", "digital", "portfolio", "marketing", "tech"],
    useWhen:
      "A portfolio or agency landing page needs another polished project preview.",
    howToUse:
      "Alternate in scroll cards; avoid using all three in one viewport.",
  },
  {
    id: "axion-studio-work-small",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png",
    description:
      "Editorial photo of a designer working on brand color palettes on a laptop.",
    mood: "process-driven, professional, design-system",
    tags: ["process", "brand", "design-system", "editorial", "agency"],
    useWhen:
      "The page needs a work-in-progress, process, or design-system story image.",
    howToUse: "Use in about/process sections or a case-study sidebar image.",
  },
  {
    id: "axion-studio-work-large",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png",
    description:
      "Wider editorial shot of brand palette exploration on a laptop.",
    mood: "process-driven, professional, design-system",
    tags: ["process", "brand", "design-system", "editorial", "agency"],
    useWhen:
      "You need a larger process/editorial image for an agency or studio page.",
    howToUse:
      "Wide image in a two-column about section or case-study hero support image.",
  },
  {
    id: "questly-hill-background",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png",
    description:
      "Minimal grassy hill under a pale blue sky with lots of copy space.",
    mood: "calm, minimal, optimistic",
    tags: ["nature", "minimal", "productivity", "background", "calm"],
    useWhen:
      "The app is a calm productivity, planning, or wellness tool without a specified hero image.",
    howToUse:
      "Full-page or panel background with UI floating above the sky area.",
  },
  {
    id: "terraelix-green-bokeh",
    kind: "image",
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260624_110248_b62f758d-f68c-4045-a7b4-91771d6d0a0f.png",
    description: "Soft green nature bokeh blur with warm sunlight.",
    mood: "organic, wellness, fresh",
    tags: ["wellness", "nature", "supplements", "background", "organic"],
    useWhen:
      "The product is wellness, supplements, organic goods, or natural health.",
    howToUse:
      "Blurred hero backdrop with sharp product UI or cards layered on top.",
  },
  {
    id: "motionsites-aethera-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
    description:
      "Animated preview of an ethereal light atmospheric landing page.",
    mood: "ethereal, light, premium",
    tags: ["preview", "landing", "atmospheric", "luxury", "gif"],
    useWhen:
      "You want motion inspiration for a soft luxury or wellness landing page.",
    howToUse:
      "Marquee/inspiration strip or small preview tile — not a full-screen background.",
  },
  {
    id: "motionsites-asme-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
    description:
      "Animated preview with engineering/industrial prestige styling.",
    mood: "serious, engineered, institutional",
    tags: ["preview", "engineering", "b2b", "gif", "landing"],
    useWhen:
      "The brief implies engineering standards, infrastructure, or serious B2B credibility.",
    howToUse: "Use in a design-reference marquee or mood board section.",
  },
  {
    id: "motionsites-celestia-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif",
    description: "Animated celestial/space-elegant landing preview.",
    mood: "celestial, elegant, cosmic",
    tags: ["space", "preview", "cosmic", "gif", "landing"],
    useWhen: "The product uses space, astronomy, or cosmic metaphors.",
    howToUse: "Small animated reference tile or inspiration carousel item.",
  },
  {
    id: "motionsites-codenest-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
    description: "Animated developer-tool landing preview.",
    mood: "technical, clean, developer-focused",
    tags: ["developer", "devtools", "preview", "gif", "landing"],
    useWhen:
      "The app is a developer tool, IDE companion, API product, or code platform.",
    howToUse:
      "Reference animation in a portfolio marquee or docs landing inspiration row.",
  },
  {
    id: "motionsites-designpro-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
    description: "Animated design-professional landing preview.",
    mood: "design-led, polished, creative",
    tags: ["design", "portfolio", "preview", "gif", "landing"],
    useWhen:
      "The product targets designers, creatives, or design-system users.",
    howToUse: "Use as a motion reference tile, not as the primary hero asset.",
  },
  {
    id: "motionsites-evr-ventures-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
    description: "Animated VC/ventures landing preview.",
    mood: "investor, bold, startup",
    tags: ["vc", "startup", "preview", "gif", "landing"],
    useWhen:
      "The page is for investors, venture content, pitch decks, or startup hubs.",
    howToUse: "Marquee/inspiration asset for fintech or startup themes.",
  },
  {
    id: "motionsites-luminex-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
    description: "Animated luminous light-tech landing preview.",
    mood: "bright, modern, clean saas",
    tags: ["saas", "light", "preview", "gif", "landing"],
    useWhen:
      "You need a clean light-mode SaaS reference without inventing a generic hero.",
    howToUse:
      "Use in inspiration strips or mood references, not as a full-page background.",
  },
  {
    id: "motionsites-new-era-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
    description: "Animated futurist launch-page preview.",
    mood: "futurist, launch, reveal",
    tags: ["launch", "futurist", "preview", "gif", "landing"],
    useWhen: "The page is a product launch, waitlist, or new-era announcement.",
    howToUse:
      "Reference tile for launch pages; pair with one strong video if needed.",
  },
  {
    id: "motionsites-nexora-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
    description: "Animated modern tech-brand landing preview.",
    mood: "modern, tech, premium saas",
    tags: ["saas", "tech", "preview", "gif", "landing"],
    useWhen:
      "The brief is a generic modern app/SaaS landing with no visual direction.",
    howToUse: "Use as a motion reference, not a literal hero background.",
  },
  {
    id: "motionsites-orbit-web3-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
    description: "Animated web3 orbit landing preview.",
    mood: "web3, orbital, bold",
    tags: ["web3", "crypto", "preview", "gif", "landing"],
    useWhen:
      "The product is explicitly web3/crypto and needs a non-generic motion reference.",
    howToUse:
      "Only for crypto/web3 contexts; use sparingly in inspiration strips.",
  },
  {
    id: "motionsites-planet-orbit-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
    description: "Animated planetary orbit landing preview.",
    mood: "space, orbital, exploratory",
    tags: ["space", "orbit", "preview", "gif", "landing"],
    useWhen:
      "The product uses orbit/space metaphors for data, teams, or exploration.",
    howToUse: "Reference tile or inspiration carousel item.",
  },
  {
    id: "motionsites-skyelite-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
    description: "Animated aviation/sky-premium landing preview.",
    mood: "aviation, premium, airy",
    tags: ["travel", "aviation", "preview", "gif", "landing"],
    useWhen:
      "The brief matches travel, aviation, or premium membership without a specified asset.",
    howToUse:
      "Pair with skyelite-hero-video if video is needed; otherwise use as motion reference.",
  },
  {
    id: "motionsites-space-voyage-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
    description: "Animated space-voyage landing preview.",
    mood: "exploratory, cinematic, cosmic",
    tags: ["space", "voyage", "preview", "gif", "landing"],
    useWhen:
      "The story is exploration, discovery, or adventure with a cosmic tone.",
    howToUse:
      "Inspiration/marquee asset; avoid stacking with multiple space assets.",
  },
  {
    id: "motionsites-stellar-ai-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
    description: "Animated AI product landing preview.",
    mood: "ai, stellar, launch-ready",
    tags: ["ai", "preview", "gif", "landing", "tech"],
    useWhen:
      "The product is an AI app, model platform, or agent tool without visual direction.",
    howToUse:
      "Use as a motion reference tile; prefer a video background if the page needs full bleed motion.",
  },
  {
    id: "motionsites-stellar-ai-v2-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
    description: "Alternate animated AI landing preview.",
    mood: "ai, polished, modern",
    tags: ["ai", "preview", "gif", "landing", "tech"],
    useWhen:
      "You need a second AI landing reference variant in a marquee or inspiration row.",
    howToUse: "Do not use both stellar AI previews in the same hero.",
  },
  {
    id: "motionsites-terra-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
    description: "Animated earth/nature landing preview.",
    mood: "earth, sustainability, natural",
    tags: ["climate", "nature", "preview", "gif", "landing"],
    useWhen:
      "The product is sustainability, climate, agriculture, or earth-focused.",
    howToUse: "Reference tile for green/nature themes.",
  },
  {
    id: "motionsites-transform-data-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
    description: "Animated data-transformation landing preview.",
    mood: "analytical, modern, data-led",
    tags: ["data", "analytics", "preview", "gif", "landing"],
    useWhen: "The app is analytics, ETL, dashboards, or data transformation.",
    howToUse: "Use in inspiration strips for data products.",
  },
  {
    id: "motionsites-vex-ventures-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
    description: "Animated ventures/pitch landing preview.",
    mood: "startup, investor, bold",
    tags: ["vc", "startup", "preview", "gif", "landing"],
    useWhen:
      "The page is startup/investor oriented and needs a motion reference.",
    howToUse:
      "Marquee tile only; pair with strong typography rather than copying layout verbatim.",
  },
  {
    id: "motionsites-vitara-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
    description: "Animated wellness/vitality landing preview.",
    mood: "health, vitality, clean",
    tags: ["wellness", "health", "preview", "gif", "landing"],
    useWhen:
      "The product is fitness, health, supplements, or vitality-focused.",
    howToUse: "Reference tile for wellness pages.",
  },
  {
    id: "motionsites-wealth-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
    description: "Animated finance/wealth landing preview.",
    mood: "finance, premium, confident",
    tags: ["finance", "wealth", "preview", "gif", "landing"],
    useWhen: "The app is finance, investing, banking, or wealth management.",
    howToUse:
      "Use as inspiration for fintech landing motion, not as a product screenshot.",
  },
  {
    id: "motionsites-xportfolio-preview",
    kind: "image",
    url: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
    description: "Animated creative portfolio landing preview.",
    mood: "portfolio, expressive, designer",
    tags: ["portfolio", "creative", "preview", "gif", "landing"],
    useWhen: "The page is a personal portfolio or creative showcase.",
    howToUse: "Reference tile in portfolio/inspiration sections.",
  },
  {
    id: "cozypaws-logo",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/0ae29d6d9628bede667f90d57bebe81b8f1ec2bf.svg",
    description: "CozyPaws pet-shop logo mark.",
    mood: "friendly, retail, pet",
    tags: ["logo", "pet", "ecommerce", "svg", "brand"],
    useWhen:
      "The app is pet retail/ecommerce and needs a friendly brand mark placeholder.",
    howToUse: "Nav logo only — not a hero background.",
  },
  {
    id: "cozypaws-avatar",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/e62173d41f91350a59628e8a9a55ae078a886fb9.png?w=128",
    description: "Small user avatar photo for pet-commerce UI.",
    mood: "friendly, human, retail",
    tags: ["avatar", "user", "pet", "ecommerce", "profile"],
    useWhen:
      "You need a sample user avatar in reviews, account menus, or community UI.",
    howToUse: "Circle avatar at 32–48px; do not use as hero art.",
  },
  {
    id: "cozypaws-product-cat-tree",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/3e5158dad63d392ade022e81890edc9f54d750bc.png",
    description:
      "Orange plush cat tree product photo on transparent/black-friendly background.",
    mood: "playful, retail, pet-product",
    tags: ["product", "pet", "cat", "ecommerce", "orange"],
    useWhen: "The shop sells pet furniture, toys, or accessories.",
    howToUse:
      "Product card image in a grid; keep on clean white/neutral surface.",
  },
  {
    id: "cozypaws-video-thumb",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/76be6ec3a93a703b15e9cc01e764a4e3f9d7d2c0.png",
    description:
      "Pet lifestyle/media thumbnail from the CozyPaws design export.",
    mood: "friendly, retail, lifestyle",
    tags: ["pet", "lifestyle", "thumbnail", "ecommerce", "media"],
    useWhen:
      "You need a pet lifestyle thumbnail for a promo tile or video block.",
    howToUse:
      "Use in a media card with play affordance; not a background texture.",
  },
  {
    id: "cozypaws-left-photo",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/8d44b25186ef45a5789c74668fb781cea4e1ff49.png",
    description: "Left pet lifestyle photo for a three-up hero collage.",
    mood: "warm, playful, retail",
    tags: ["pet", "lifestyle", "hero", "collage", "dog"],
    useWhen:
      "The page is pet ecommerce/marketing and needs authentic lifestyle imagery.",
    howToUse: "One panel in a 3-image hero collage.",
  },
  {
    id: "cozypaws-center-photo",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/96745c4e72ad5c5208e53a885df797fd82cd854a.png?h=1024",
    description: "Golden retriever peeking over a green banner bar.",
    mood: "friendly, promotional, pet",
    tags: ["dog", "promo", "banner", "pet", "hero"],
    useWhen:
      "You need a friendly promo banner, announcement, or empty-state with copy space.",
    howToUse:
      "Place headline/CTA on the green bar area; use as hero or promo strip.",
  },
  {
    id: "cozypaws-right-photo",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/81bd2e7a66b58f3d8f3ad78fd1ebf01af8dfdee1.png",
    description: "Right pet lifestyle photo for a three-up hero collage.",
    mood: "warm, playful, retail",
    tags: ["pet", "lifestyle", "hero", "collage", "dog"],
    useWhen:
      "Pet brand pages need a third lifestyle image to complete a collage hero.",
    howToUse:
      "Use with cozypaws-left-photo and cozypaws-center-photo as a set.",
  },
  {
    id: "terraelix-avatar",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/ca8093996e970200cbcf8bde8744175e52da5a79.png",
    description: "Wellness shop avatar/profile image.",
    mood: "clean, wellness, retail",
    tags: ["avatar", "wellness", "profile", "supplements"],
    useWhen:
      "A wellness ecommerce UI needs a sample profile or testimonial avatar.",
    howToUse: "Small avatar or testimonial chip image.",
  },
  {
    id: "terraelix-capsule-product",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/6a7de4fbe9c9e2315040607320a9ff5e93117bf4.png",
    description: "Supplement capsule product shot.",
    mood: "clinical-clean, organic wellness",
    tags: ["product", "supplements", "capsule", "wellness", "ecommerce"],
    useWhen: "The store sells vitamins, supplements, or capsules.",
    howToUse: "Hero product image or featured card on a wellness landing page.",
  },
  {
    id: "terraelix-bottle-product",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/50ad042b3cd48a2e120ea3ba17c8cfeaf3cc334c.png",
    description: "Supplement bottle/pack product photo.",
    mood: "clean, wellness, retail",
    tags: ["product", "supplements", "bottle", "wellness", "ecommerce"],
    useWhen:
      "The page needs a second product format in a wellness catalog or hero.",
    howToUse: "Product card or split hero product render.",
  },
  {
    id: "terraelix-assessment-image",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/6736cbe6e26afa2cd7c04a91892a79f7640785b5.png",
    description: "Wellness assessment/onboarding visual.",
    mood: "guided, health, onboarding",
    tags: ["assessment", "quiz", "wellness", "onboarding", "health"],
    useWhen:
      "The app includes a health quiz, onboarding assessment, or recommendation flow.",
    howToUse: "Split-section illustration beside quiz/assessment copy.",
  },
  {
    id: "terraelix-panel-product",
    kind: "image",
    url: "https://polo-pecan-73837341.figma.site/_assets/v11/30e8f38d1f993c357a3be2721557fc899d5640fc.png",
    description: "Panel-style wellness product render.",
    mood: "premium wellness, clean commerce",
    tags: ["product", "wellness", "panel", "ecommerce", "supplements"],
    useWhen:
      "You need a larger product render for a feature band or product detail page.",
    howToUse: "Use in a product spotlight section with short copy and CTA.",
  },
  {
    id: "questly-grass-texture",
    kind: "image",
    url: "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png",
    description: "Grass texture patch for playful/nature UI accents.",
    mood: "playful, natural, gamified",
    tags: ["grass", "texture", "nature", "accent", "gamified"],
    useWhen:
      "The UI wants a subtle nature/gamified accent rather than a full photo hero.",
    howToUse:
      "Corner decoration, ground layer, or small texture accent — not a full-page background.",
  },
  {
    id: "jack-about-moon-icon",
    kind: "image",
    url: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png",
    description: "3D moon icon for playful portfolio decoration.",
    mood: "playful, personal, whimsical",
    tags: ["3d", "icon", "decorative", "portfolio", "moon"],
    useWhen: "The page is a personal portfolio or playful about section.",
    howToUse:
      "Absolute-positioned decorative asset with subtle parallax; never the hero background.",
  },
  {
    id: "jack-about-lego-icon",
    kind: "image",
    url: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png",
    description: "3D lego brick icon for builder personality sections.",
    mood: "playful, maker, builder",
    tags: ["3d", "icon", "decorative", "portfolio", "maker"],
    useWhen: "The site emphasizes building, tinkering, or maker energy.",
    howToUse: "Floating corner decoration on about/contact sections.",
  },
  {
    id: "jack-about-abstract-blob",
    kind: "image",
    url: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png",
    description: "3D abstract blob decoration.",
    mood: "creative, abstract, personal",
    tags: ["3d", "icon", "decorative", "portfolio", "abstract"],
    useWhen: "You want a soft abstract accent on a portfolio/about page.",
    howToUse: "Small floating decorative element, low opacity optional.",
  },
  {
    id: "jack-about-group-shape",
    kind: "image",
    url: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png",
    description: "3D abstract grouped shape decoration.",
    mood: "creative, abstract, personal",
    tags: ["3d", "icon", "decorative", "portfolio", "abstract"],
    useWhen: "A personal portfolio page needs one more playful visual accent.",
    howToUse:
      "Pair with other jack-about icons; use one or two per page maximum.",
  },
] as const;

export function catalogToPastMediaLibrary(
  catalog: readonly PastMediaCatalogEntry[] = HARDCODED_PAST_MEDIA_CATALOG,
) {
  return {
    videos: catalog
      .filter((entry) => entry.kind === "video")
      .map((entry) => entry.url),
    images: catalog
      .filter((entry) => entry.kind === "image")
      .map((entry) => entry.url),
  };
}
