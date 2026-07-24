export const name = "Toast notifications (sonner)";

export const importDocs = `
import { Toaster, toast } from "sonner"
`;

export const usageDocs =
  "Import Toaster and toast from the sonner package — never from @/components/ui/sonner (that path does not exist). Mount <Toaster /> near the app root and call toast() / toast.promise() for transient completion feedback.";
