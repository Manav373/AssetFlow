"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  fill?: boolean;
}

function NavItem({ href, icon, label, fill = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-150 ${
        isActive
          ? "text-primary border-l-4 border-primary bg-primary-container/10 font-semibold"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontVariationSettings: `'FILL' ${isActive || fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        {icon}
      </span>
      <span className="font-label-md text-label-md">{label}</span>
    </Link>
  );
}

interface SuggestionItem {
  label: string;
  shortcut?: string;
  action: () => void;
  icon: string;
  category: "Pages" | "Quick Filters" | "Commands";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // Keyboard shortcut listener to focus search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Auto-hide dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchQuery.startsWith("/")) {
        // Direct route short circuit
        const targetRoute = searchQuery.slice(1).trim();
        router.push(`/${targetRoute}`);
      } else {
        router.push(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Define static suggestions & shortcut actions
  const allSuggestions: SuggestionItem[] = [
    // Pages / Commands
    {
      label: "Go to Dashboard",
      shortcut: "G + D",
      category: "Pages",
      icon: "dashboard",
      action: () => router.push("/dashboard"),
    },
    {
      label: "View Asset Inventory",
      shortcut: "G + A",
      category: "Pages",
      icon: "inventory_2",
      action: () => router.push("/assets"),
    },
    {
      label: "Open Maintenance Board",
      shortcut: "G + M",
      category: "Pages",
      icon: "build",
      action: () => router.push("/maintenance"),
    },
    {
      label: "Check Physical Audits",
      shortcut: "G + U",
      category: "Pages",
      icon: "fact_check",
      action: () => router.push("/audit"),
    },
    {
      label: "Book a Room/Vehicle",
      shortcut: "G + B",
      category: "Pages",
      icon: "event_available",
      action: () => router.push("/booking"),
    },
    {
      label: "View Analytics & Reports",
      shortcut: "G + R",
      category: "Pages",
      icon: "analytics",
      action: () => router.push("/reports"),
    },
    {
      label: "AI Support Portal",
      shortcut: "G + S",
      category: "Pages",
      icon: "help",
      action: () => router.push("/support"),
    },
    // Quick Queries / Filters
    {
      label: "Show Available Laptops",
      category: "Quick Filters",
      icon: "laptop_mac",
      action: () => {
        setSearchQuery("Laptop Available");
        router.push("/assets?q=Laptop");
      },
    },
    {
      label: "Filter: Under Maintenance",
      category: "Quick Filters",
      icon: "engineering",
      action: () => {
        setSearchQuery("status:maintenance");
        router.push("/assets?q=maintenance");
      },
    },
    {
      label: "Find Q3 Inventory Audit",
      category: "Quick Filters",
      icon: "search_check",
      action: () => {
        router.push("/audit");
      },
    },
  ];

  // Dynamically filter suggestions
  const filteredSuggestions = allSuggestions.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  // Handle keyboard events when dropdown is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowDropdown(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          filteredSuggestions[selectedIndex].action();
          setShowDropdown(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-on-background font-mono text-sm">
        <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* SideNavBar */}
      <aside className="w-64 border-r border-outline-variant bg-surface flex flex-col py-6 shrink-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                inventory_2
              </span>
            </div>
            <div>
              <h1 className="font-hanken font-bold text-lg leading-none text-primary">
                AssetFlow
              </h1>
              <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mt-1">
                Enterprise Management
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          <NavItem href="/dashboard" icon="dashboard" label="Dashboard" />
          <NavItem href="/org-setup" icon="corporate_fare" label="Org Setup" />
          <NavItem href="/assets" icon="inventory_2" label="Assets" />
          <NavItem href="/allocation" icon="assignment_ind" label="Allocation" />
          <NavItem href="/booking" icon="event_available" label="Booking" />
          <NavItem href="/maintenance" icon="build" label="Maintenance" />
          <NavItem href="/audit" icon="fact_check" label="Audit" />
          <NavItem href="/reports" icon="analytics" label="Reports" />
          <NavItem href="/notifications" icon="notifications" label="Notifications" />
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
          <NavItem href="/settings" icon="settings" label="Settings" />
          <NavItem href="/support" icon="help" label="Support" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TopNavBar */}
        <header className="h-16 bg-surface border-b border-outline-variant grid grid-cols-3 items-center px-6 shrink-0 z-20">
          
          {/* Left Column — Breadcrumb indicator or brand helper */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Workspace Active
          </div>

          {/* Center Column — Centered Search Bar with Suggestions */}
          <div className="relative w-full max-w-lg justify-self-center z-30">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
                  search
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-surface-container border border-outline-variant/65 rounded-xl pl-11 pr-20 py-2.5 text-sm focus:ring-2 focus:ring-primary/45 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                  placeholder="Search assets, tasks, commands..."
                  value={searchQuery}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {/* Keyboard shortcut hint inside input */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                  <kbd className="bg-surface-container-high border border-outline-variant/40 text-[10px] px-1.5 py-0.5 rounded font-mono text-on-surface-variant/70 shadow-sm">
                    Ctrl
                  </kbd>
                  <kbd className="bg-surface-container-high border border-outline-variant/40 text-[10px] px-1.5 py-0.5 rounded font-mono text-on-surface-variant/70 shadow-sm">
                    K
                  </kbd>
                </div>
              </div>
            </form>

            {/* Premium Autocomplete Dropdown */}
            {showDropdown && filteredSuggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-surface/95 border border-outline-variant/60 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md max-h-[360px] overflow-y-auto no-scrollbar py-2 z-50 flex flex-col divide-y divide-outline-variant/15"
              >
                {/* Group suggestions by category */}
                {["Pages", "Quick Filters"].map((categoryGroup) => {
                  const items = filteredSuggestions.filter(
                    (i) => i.category === categoryGroup
                  );
                  if (items.length === 0) return null;

                  return (
                    <div key={categoryGroup} className="py-2 px-1">
                      <div className="text-[10px] font-bold text-primary px-3 pb-1.5 uppercase tracking-widest opacity-80">
                        {categoryGroup}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const overallIndex = filteredSuggestions.indexOf(item);
                          const isSelected = selectedIndex === overallIndex;

                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                item.action();
                                setShowDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined text-lg ${isSelected ? "text-primary" : "text-on-surface-variant/60"}`}>
                                  {item.icon}
                                </span>
                                <span className="text-xs">{item.label}</span>
                              </div>
                              {item.shortcut && (
                                <span className="text-[9px] font-mono opacity-50 px-1.5 py-0.5 bg-surface-container-highest/30 rounded border border-outline-variant/10">
                                  {item.shortcut}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className="px-3 py-2 text-[10px] text-on-surface-variant/40 font-mono flex justify-between items-center bg-surface-container-low/20">
                  <span>Use ↑↓ to navigate, Enter to select</span>
                  <span>Esc to close</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Actions & Settings */}
          <div className="justify-self-end flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link
                href="/support"
                className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                title="Help"
              >
                <span className="material-symbols-outlined">help</span>
              </Link>
              <Link
                href="/dashboard"
                className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                title="Dashboard Home"
              >
                <span className="material-symbols-outlined">apps</span>
              </Link>
            </div>
            <div className="h-8 w-px bg-outline-variant"></div>
            <Link
              href="/assets/new"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center"
            >
              Add Asset
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              title="Settings"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container font-semibold">
                <img
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2zmEO92ZQ2e7MV3Y79w40MWD_zTyJWvcSXqOgckc5nCI93bTeCtIuTHe-M9fbOgEH_bKPSy_Yfn_URWdK1xICvCJVW0To7HQQCutBltMwAbti2kZsqUy29avYVsSJqG5zA3YnoXHF43hMSBzsvfR__WQ0lDp21WI8omKMlyOeiks1CVBz3CXJR0hJVnmqakc6k8bFPkgMlozhZZ9taBoWRrqnsme383tc71Orb0ivEbq231lM9Bjrn_mmHpGgeVkKFqzuPmiYD-6L"
                />
              </div>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="p-2 text-on-surface-variant hover:text-error transition-colors flex items-center justify-center cursor-pointer"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Atmospheric Background Blurs */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
