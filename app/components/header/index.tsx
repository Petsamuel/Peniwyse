import { FC, Fragment, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdHome, MdAccountCircle, MdLogout } from "react-icons/md";
import { MenuIcon } from "@/app/assets/icons/sidebar-icons";
import { useTradingPartner } from "@/app/hooks/use-trading-partners";
import { useLiquidityPartner } from "@/app/hooks/use-liquidity-partners";
import { useDocumentTypes } from "@/app/hooks/use-document-types";
import { truncate } from "@/app/utils/truncate";
import { clearClientToken } from "@/app/utils/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useRole } from "@/app/context/role-context";

interface HeaderProps {
  onMenuToggle: () => void;
  isScrolled: boolean;
}

const Breadcrumb: FC<{ isScrolled: boolean }> = ({ isScrolled }) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const partnerId =
    segments[0] === "approvals" || segments[0] === "trading-partners"
      ? (segments[1] ?? "")
      : "";
  const docId = segments[2] === "documents" ? (segments[3] ?? "") : "";

  const lpId = segments[0] === "lp-management" ? (segments[1] ?? "") : "";

  const { data: partner } = useTradingPartner(partnerId);
  const { data: lp } = useLiquidityPartner(lpId);
  const { data: documentTypes = [] } = useDocumentTypes();

  const staticLabels: Record<string, string> = {
    approvals: "Approvals",
    "trading-partners": "Trading Partners",
    "lp-management": "LP Management",
    purchase: "Purchase",
    treasury: "Treasury",
    rate: "Rate Management",
  };

  // Build a segment → human label override map
  const labelOverrides: Record<string, string> = {};
  if (partnerId && partner) {
    labelOverrides[partnerId] = partner.name;
  }
  if (lpId && lp) {
    labelOverrides[lpId] = lp.name;
  }
  if (docId && partner) {
    const doc = (partner.documents ?? []).find((d) => d.id === docId);
    const docType = doc
      ? documentTypes.find((dt) => dt.id === doc.documentTypeId)
      : undefined;
    if (docType) labelOverrides[docId] = docType.name;
  }

  const resolveLabel = (seg: string): string => {
    if (labelOverrides[seg]) return labelOverrides[seg];
    if (staticLabels[seg]) return staticLabels[seg];
    const decoded = decodeURIComponent(seg);
    return decoded.startsWith("http")
      ? (decoded.split("/").pop() ?? decoded)
      : seg.replace(/-/g, " ");
  };

  const lastLabel = resolveLabel(segments[segments.length - 1] ?? "");

  return (
    <div className="flex flex-col gap-0.5 min-w-0 flex-1 font-sans">
      {/* Crumb trail */}
      {segments.length > 1 && (
        <nav className="flex items-center gap-1 text-[11px] text-muted-theme font-medium">
          <Link
            href="/dashboard"
            className="flex items-center text-muted-theme hover:text-[#1596fe] transition-colors"
          >
            <MdHome size={16} />
          </Link>

          {segments.slice(0, -1).map((seg, i) => {
            const rawHref = "/" + segments.slice(0, i + 1).join("/");
            const href =
              seg === "documents"
                ? "/" + segments.slice(0, i).join("/")
                : rawHref;
            const label = resolveLabel(seg);

            return (
              <Fragment key={rawHref}>
                <span className="select-none opacity-50">/</span>
                <Link
                  href={href}
                  className="capitalize hover:text-[#1596fe] transition-colors"
                >
                  {truncate(label)}
                </Link>
              </Fragment>
            );
          })}
          <span className="select-none opacity-50">/</span>
        </nav>
      )}

      {/* Page title — last segment */}
      <div className={`flex items-center gap-3 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-foreground text-lg font-bold tracking-tight capitalize">
          {segments.length === 0 ? "Home" : truncate(lastLabel)}
        </h1>
      </div>

    </div>
  );
};

const UserMenu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { role } = useRole();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearClientToken();
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-card-bg/10 hover:bg-card-bg/20 text-muted-theme hover:text-accent transition-all border border-border-theme group"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-muted-theme uppercase tracking-widest group-hover:text-accent transition-colors">
            {role || 'User'}
          </span>
          <span className="text-[9px] text-muted-theme/60 font-medium">Administrator</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <MdAccountCircle size={24} />
        </div>
      </button>


      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-card-bg rounded-2xl shadow-2xl border border-border-theme py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border-theme mb-1 bg-surface-hover/30">
                <p className="text-xs font-bold text-foreground">User Session Details</p>
                <div className="mt-2 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-theme">Role:</span>
                        <span className="text-accent font-bold uppercase">{role}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-theme">Access Level:</span>
                        <span className="text-foreground font-medium">Full Administrative</span>
                    </div>
                </div>
            </div>

            <Link
              href="/settings"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-surface-hover transition-colors"
            >
              <MdAccountCircle size={18} className="text-muted-theme" />
              <span>Profile Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/5 transition-colors text-left"
            >
              <MdLogout size={18} />
              <span>Logout Session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

const DashboardHeader: FC<HeaderProps> = ({ onMenuToggle, isScrolled }) => {
  return (
    <header
      className="flex w-full items-center justify-between px-6 py-2 min-h-18.75 transition-[box-shadow,border-radius,background-color] duration-300"
      style={
        isScrolled
          ? {
              borderRadius: "0.75rem",
              backdropFilter: "saturate(200%) blur(1.875rem)",
              WebkitBackdropFilter: "saturate(200%) blur(1.875rem)",
              boxShadow: "var(--header-shadow)",
              backgroundColor: "var(--header-bg)",
            }
          : {
              backgroundColor: "transparent",
            }
      }
    >

      {/* Left: menu toggle + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-muted-theme hover:text-[#1596fe] transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <Breadcrumb isScrolled={isScrolled} />
      </div>

      {/* Right: profile actions */}
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
};

export default DashboardHeader;
