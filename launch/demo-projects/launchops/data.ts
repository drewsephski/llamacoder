export type OpsRole = "Owner" | "Developer" | "Viewer";
export type OpsStatus = "Healthy" | "Review" | "Blocked";

export type OpsProject = {
  id: string;
  name: string;
  customer: string;
  environment: string;
  status: OpsStatus;
  owner: string;
  updated: string;
  requests: string;
};

export const opsProjects: OpsProject[] = [
  {
    id: "OP-207",
    name: "Billing API rollout",
    customer: "Northstar Books",
    environment: "Production",
    status: "Review",
    owner: "Mina",
    updated: "12 min ago",
    requests: "18.4k",
  },
  {
    id: "OP-203",
    name: "Creator workspace",
    customer: "Folded Note",
    environment: "Production",
    status: "Healthy",
    owner: "Drew",
    updated: "28 min ago",
    requests: "41.7k",
  },
  {
    id: "OP-198",
    name: "Partner import",
    customer: "Redwood Supply",
    environment: "Staging",
    status: "Blocked",
    owner: "Iris",
    updated: "1 hr ago",
    requests: "2.8k",
  },
  {
    id: "OP-191",
    name: "Team permissions",
    customer: "Paper Kite Labs",
    environment: "Production",
    status: "Healthy",
    owner: "Jon",
    updated: "3 hrs ago",
    requests: "9.6k",
  },
  {
    id: "OP-187",
    name: "Usage exports",
    customer: "Harbor Ledger",
    environment: "Preview",
    status: "Review",
    owner: "Mina",
    updated: "Yesterday",
    requests: "6.1k",
  },
];

export const opsActivity = [
  ["Runtime check completed", "Billing API rollout", "12 min ago", "Mina"],
  ["Environment variable rotated", "Creator workspace", "28 min ago", "Drew"],
  ["Webhook delivery failed", "Partner import", "1 hr ago", "Fixture worker"],
  ["Role changed to Viewer", "Team permissions", "3 hrs ago", "Jon"],
];

export const opsFiles = [
  ["launch/demo-projects/launchops", "folder"],
  ["LaunchOpsApp.tsx", "file"],
  ["data.ts", "file"],
  ["launchops.css", "file"],
  ["demo.json", "file"],
  ["captions.json", "file"],
  ["README.md", "file"],
] as const;
