export type LeadStatus = "New" | "Quoted" | "Scheduled" | "Completed";

export type FieldFlowLead = {
  id: string;
  customer: string;
  initials: string;
  service: string;
  address: string;
  requested: string;
  status: LeadStatus;
  quote: number | null;
  appointment: string;
  phone: string;
  email: string;
  note: string;
};

export const fieldFlowLeads: FieldFlowLead[] = [
  {
    id: "FF-1842",
    customer: "Elena Morales",
    initials: "EM",
    service: "Panel upgrade",
    address: "1848 W Belle Plaine Ave, Chicago",
    requested: "Today, 8:42 AM",
    status: "Quoted",
    quote: 4860,
    appointment: "Thu, Aug 20 at 9:00 AM",
    phone: "(312) 555-0148",
    email: "elena.morales@example.test",
    note: "Home office circuits trip when the air conditioner starts.",
  },
  {
    id: "FF-1841",
    customer: "Marcus Bell",
    initials: "MB",
    service: "EV charger install",
    address: "509 S Euclid Ave, Oak Park",
    requested: "Yesterday, 4:16 PM",
    status: "Scheduled",
    quote: 2180,
    appointment: "Fri, Aug 21 at 1:30 PM",
    phone: "(708) 555-0192",
    email: "marcus.bell@example.test",
    note: "Detached garage already has a 60-amp subpanel.",
  },
  {
    id: "FF-1839",
    customer: "Priya Nair",
    initials: "PN",
    service: "Lighting repair",
    address: "921 N Leavitt St, Chicago",
    requested: "Mon, 11:08 AM",
    status: "New",
    quote: null,
    appointment: "Not scheduled",
    phone: "(773) 555-0116",
    email: "priya.nair@example.test",
    note: "Kitchen pendants flicker after dimmer replacement.",
  },
  {
    id: "FF-1836",
    customer: "Owen Park",
    initials: "OP",
    service: "Safety inspection",
    address: "1462 W Walton St, Chicago",
    requested: "Sun, 2:22 PM",
    status: "Completed",
    quote: 640,
    appointment: "Completed Aug 17",
    phone: "(312) 555-0171",
    email: "owen.park@example.test",
    note: "Pre-sale inspection for a three-flat garden unit.",
  },
];

export const fieldFlowServices = [
  {
    name: "Same-week repairs",
    body: "Outlets, lighting, breakers, and urgent troubleshooting.",
    timeframe: "Most visits within 48 hours",
  },
  {
    name: "Home upgrades",
    body: "Panels, EV charging, smart controls, and dedicated circuits.",
    timeframe: "Clear quote before work begins",
  },
  {
    name: "Safety inspections",
    body: "Practical reports for homeowners, buyers, and small landlords.",
    timeframe: "Written findings the same day",
  },
];
