import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label?: string;
  href?: string;
  icon?: string;
  divider?: boolean;
  submenu?: SidebarItem[];
}

interface GlassSidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  onLogout?: () => void;
}

/**
 * GlassSidebar - Sidebar com estilo Glassmorphism
 */
export function GlassSidebar({
  items,
  logo,
  onLogout,
}: GlassSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    return href && location.pathname === href;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      {logo && (
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {logo}
            <span className="font-bold text-lg text-foreground">ONG Camila</span>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item, index) => {
          if (item.divider) {
            return (
              <div
                key={`divider-${index}`}
                className="my-4 border-t border-white/10"
              />
            );
          }

          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = isActive(item.href);

          return (
            <div key={item.label}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                    "transition-all duration-200",
                    isExpanded
                      ? "bg-white/20 text-primary"
                      : "text-foreground hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <Link
                  to={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    "transition-all duration-200",
                    active
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-foreground hover:bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <span className="text-xl">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-4 mt-2 space-y-1 border-l border-white/20 pl-4">
                  {item.submenu!.map((subitem) => (
                    <Link
                      key={subitem.label}
                      to={subitem.href || "#"}
                      className={cn(
                        "block px-4 py-2 rounded-lg text-sm",
                        "transition-all duration-200",
                        isActive(subitem.href)
                          ? "bg-primary/20 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-64 h-screen",
          "bg-white/80 backdrop-blur-md border-r border-white/30",
          "shadow-glass fixed left-0 top-0 z-40"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={cn(
              "flex flex-col w-64 h-screen",
              "bg-white/95 backdrop-blur-md border-r border-white/30",
              "shadow-glass"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
