import {
  LayoutDashboard,
  Server,
  MessageSquare,
  CreditCard,
  BookOpen,
  HelpCircle,
  Mail,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  labelKey: string;
}

export const navItems: NavItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { path: "/instances", icon: Server, labelKey: "nav.instances" },
  { path: "/messages", icon: MessageSquare, labelKey: "nav.messages" },
  { path: "/billing", icon: CreditCard, labelKey: "nav.billing" },
  { path: "/api-docs", icon: BookOpen, labelKey: "nav.apiDocs" },
  { path: "/contact", icon: Mail, labelKey: "nav.contact" },
  { path: "/faq", icon: HelpCircle, labelKey: "nav.faq" },
];
