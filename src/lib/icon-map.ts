import {
  Box,
  Camera,
  ChefHat,
  Cloud,
  CloudCog,
  Code2,
  Cpu,
  Database,
  FileCode,
  Gamepad2,
  Hammer,
  Layers,
  Link2,
  Mail,
  Mountain,
  Network,
  Plane,
  Server,
  Swords,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Box,
  Camera,
  ChefHat,
  Cloud,
  CloudCog,
  Cpu,
  Database,
  FileCode,
  Gamepad2,
  Github: Code2,
  Hammer,
  Layers,
  Linkedin: Link2,
  Mail,
  Mountain,
  Network,
  Plane,
  Server,
  Swords,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Box;
}
