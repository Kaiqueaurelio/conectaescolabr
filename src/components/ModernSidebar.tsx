import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
  divider?: boolean;
}

interface ModernSidebarProps {
  items: SidebarItem[];
  logo?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * ModernSidebar - Sidebar moderno e responsivo
 */
export function ModernSidebar({ items, logo, footer, className }: ModernSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    if (item.divider) {
      return <div key={item.label} className="my-2 h-px bg-border" />;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.label);

    return (
      <div key={item.label}>
        {item.href ? (
          <Link
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
              isItemActive
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:text-foreground hover:bg-muted"
            )}
            style={{ paddingLeft: `${12 + level * 12}px` }}
          >
            {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
              "text-foreground/70 hover:text-foreground hover:bg-muted"
            )}
            style={{ paddingLeft: `${12 + level * 12}px` }}
          >
            {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform flex-shrink-0",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border overflow-y-auto transition-transform duration-300 z-40",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          {logo && (
            <div className="p-6 border-b border-border">
              {logo}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1">
              {items.map((item) => renderItem(item))}
            </div>
          </nav>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  href: string;
  icon?: ReactNode;
  label: string;
  badge?: string | number;
  isActive?: boolean;
}

/**
 * SidebarNavItem - Item individual de navegação
 */
export function SidebarNavItem({
  href,
  icon,
  label,
  badge,
  isActive,
}: SidebarNavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      )}
    >
      {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}
