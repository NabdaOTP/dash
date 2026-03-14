import {
  HelpCircle,
  LayoutDashboard,
  Mail,
  Server,
  type LucideIcon
} from "lucide-react";
 
export interface NavItem {
  path: string;
  icon: LucideIcon;
  labelKey: string;
}
 
export const navItems: NavItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { path: "/instances", icon: Server, labelKey: "nav.instances" },
  { path: "/contact", icon: Mail, labelKey: "nav.contact" },
  { path: "/faq", icon: HelpCircle, labelKey: "nav.faq" },
];