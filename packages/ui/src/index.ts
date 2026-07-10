import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export Lucide icons commonly used across Trust & Safety
export {
  Shield,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Search,
  Activity,
  Lock,
  Users,
  Clock,
} from "lucide-react";
