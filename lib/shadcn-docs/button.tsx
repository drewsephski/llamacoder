export const name = "Button";

export const importDocs = `
import { Button } from "/components/ui/button"
`;

export const usageDocs = `
<Button>A normal button</Button>
<Button variant='secondary'>Button</Button>
<Button variant='destructive'>Button</Button>
{/* Outline/secondary CTAs always need readable resting text — seeded outline includes text-foreground; still pair custom fills with matching text-* */}
<Button variant='outline'>Button</Button>
<Button variant='ghost'>Button</Button>
<Button variant='link'>Button</Button>
{/* Branded secondary / nav Login: override hover as a complete recipe, or use a native button/link with full custom classes — never leave a gray hover:text fighting the resting color. */}
<Button variant='ghost' className='text-foreground hover:bg-muted'>Log in</Button>
{/* Hero secondary: never rely on parent text-white over a light fill — use an explicit pair */}
<Button variant='outline' className='border-neutral-700 bg-transparent text-neutral-50 hover:bg-neutral-900'>Learn more</Button>
`;
