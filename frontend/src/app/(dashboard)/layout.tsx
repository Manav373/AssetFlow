"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      {/* SideNavBar */}
      <aside className="w-64 border-r border-outline-variant bg-surface flex flex-col py-6 shrink-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                inventory_2
              </span>
            </div>
            <div>
              <h1 className="font-hanken font-bold text-lg leading-none text-primary">AssetFlow</h1>
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
        <header className="h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60"
                placeholder="Search activities, assets, or logs..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link href="/support" className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center" title="Help">
                <span className="material-symbols-outlined">help</span>
              </Link>
              <Link href="/dashboard" className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center" title="Dashboard Home">
                <span className="material-symbols-outlined">apps</span>
              </Link>
            </div>
            <div className="h-8 w-px bg-outline-variant"></div>
            <Link href="/assets/new" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center">
              Add Asset
            </Link>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" title="Settings">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container font-semibold">
                <img
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2zmEO92ZQ2e7MV3Y79w40MWD_zTyJWvcSXqOgckc5nCI93bTeCtIuTHe-M9fbOgEH_bKPSy_Yfn_URWdK1xICvCJVW0To7HQQCutBltMwAbti2kZsqUy29avYVsSJqG5zA3YnoXHF43hMSBzsvfR__WQ0lDp21WI8omKMlyOeiks1CVBz3CXJR0hJVnmqakc6k8bFPkgMlozhZZ9taBoWRrqnsme383tc71Orb0ivEbq231lM9Bjrn_mmHpGgeVkKFqzuPmiYD-6L"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Atmospheric Background Blurs */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
