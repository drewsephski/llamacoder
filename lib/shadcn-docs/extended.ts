type ShadcnDoc = {
  name: string;
  importDocs: string;
};

function defineDoc(name: string, importDocs: string): ShadcnDoc {
  return { name, importDocs };
}

export const extendedShadcnDocs: ShadcnDoc[] = [
  defineDoc(
    "Accordion",
    `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"`,
  ),
  defineDoc(
    "Alert",
    `import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"`,
  ),
  defineDoc("Badge", `import { Badge } from "@/components/ui/badge"`),
  defineDoc(
    "Breadcrumb",
    `import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"`,
  ),
  defineDoc("Calendar", `import { Calendar } from "@/components/ui/calendar"`),
  defineDoc(
    "Carousel",
    `import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"`,
  ),
  defineDoc("Checkbox", `import { Checkbox } from "@/components/ui/checkbox"`),
  defineDoc(
    "Collapsible",
    `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"`,
  ),
  defineDoc(
    "Form",
    `import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"`,
  ),
  defineDoc(
    "Hover Card",
    `import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"`,
  ),
  defineDoc(
    "Menubar",
    `import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"`,
  ),
  defineDoc(
    "Navigation Menu",
    `import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"`,
  ),
  defineDoc(
    "Pagination",
    `import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"`,
  ),
  defineDoc("Progress", `import { Progress } from "@/components/ui/progress"`),
  defineDoc(
    "Resizable",
    `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"`,
  ),
  defineDoc(
    "Scroll Area",
    `import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`,
  ),
  defineDoc(
    "Separator",
    `import { Separator } from "@/components/ui/separator"`,
  ),
  defineDoc("Skeleton", `import { Skeleton } from "@/components/ui/skeleton"`),
  defineDoc("Slider", `import { Slider } from "@/components/ui/slider"`),
  defineDoc(
    "Table",
    `import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"`,
  ),
  defineDoc(
    "Toggle Group",
    `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"`,
  ),
  defineDoc("Toggle", `import { Toggle } from "@/components/ui/toggle"`),
];
