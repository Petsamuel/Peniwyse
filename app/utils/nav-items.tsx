import { ROLES } from "@/app/context/role-context";
import {
  MdDashboard,
  MdPersonAdd,
  MdDescription,
  MdAccountBalance,
  MdTrendingUp,
  MdPeople,
  MdBusiness,
  MdShoppingCart,
  MdAttachMoney,
  MdBarChart,
  MdPointOfSale,
  MdInventory,
  MdSecurity,
  MdOutlineAutoGraph,
  MdSettings,
} from "react-icons/md";
import { FaHandHoldingUsd } from "react-icons/fa";

export interface NavItemData {
  id?: string | number;
  title: string;
  icon?: React.ReactNode;
  group?: string;
  submenu?: NavItemData[];
  url?: string;
  roles?: string[];
}

export interface NavItemProps {
  item: NavItemData;
  depth?: number;
}

export const sidenavItems: NavItemData[] = [
  {
    id: 3,
    title: "dashboard",
    icon: <MdDashboard />,
    url: "/dashboard",
    group: "General",
    roles: [
      ROLES.INITIATOR,
      ROLES.APPROVER,
      ROLES.SUPER_ADMIN,
      ROLES.TREASURER,
    ],
  },
  {
    id: 1,
    title: "onboarding",
    icon: <MdPersonAdd />,
    group: "General",
    roles: [
      ROLES.INITIATOR,
      ROLES.APPROVER,
      ROLES.SUPER_ADMIN,
      ROLES.COMPLIANCE,
      ROLES.TREASURER,
      ROLES.TREASURER_TEAM,
      ROLES.AUDIT,
      ROLES.MARKETER,
      ROLES.MARKETERS,
    ],
    submenu: [
      {
        title: "overview",
        url: "/onboarding",
        icon: <MdOutlineAutoGraph />,
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          // ROLES.COMPLIANCE,
          // ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
          ROLES.MARKETER,
          ROLES.MARKETERS,
        ],
      },
      {
        id: 11,
        title: "trading partners",
        icon: <MdPeople />,
        url: "/trading-partners",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.COMPLIANCE,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
          ROLES.AUDIT,
          ROLES.MARKETER,
          ROLES.MARKETERS,
        ],
      },
      {
        id: 4,
        title: "documents",
        icon: <MdDescription />,
        url: "/documents",
        roles: [ROLES.INITIATOR, ROLES.APPROVER, ROLES.SUPER_ADMIN],
      },
      {
        id: "submissions",
        title: "form submissions",
        icon: <MdDescription />,
        url: "/onboarding/submissions",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.COMPLIANCE,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
          ROLES.AUDIT,
          ROLES.MARKETER,
          ROLES.MARKETERS,
        ],
      },
      {
        id: 14,
        title: "LP management",
        icon: <MdBusiness />,
        url: "/lp-management",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.AUDIT,
          ROLES.MARKETER,
          ROLES.MARKETERS,
        ],
      },
      {
        id: "invites",
        title: "invite lookup",
        icon: <MdPersonAdd />,
        url: "/trading-partners/invites",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.COMPLIANCE,
          ROLES.MARKETER,
          ROLES.MARKETERS,
        ],
      },
    ],
  },

  // ── Treasury ──────────────────────────────────────
  {
    id: 7,
    title: "treasury",
    icon: <MdAccountBalance />,
    group: "Finance",
    roles: [
      ROLES.APPROVER,
      ROLES.SUPER_ADMIN,
      ROLES.TREASURER,
      ROLES.TREASURER_TEAM,
    ],
    submenu: [
      {
        title: "overview",
        url: "/treasury",
        icon: <MdOutlineAutoGraph />,
        roles: [
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
        ],
      },
      {
        id: 8,
        title: "rate",
        icon: <MdTrendingUp />,
        url: "/rate",
        roles: [
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
        ],
      },
    ],
  },

  // ── Transactions ──────────────────────────────────
  // {
  //   id: "transactions",
  //   title: "transactions",
  //   icon: <MdBarChart />,
  //   url: "/transactions",
  //   group: "Finance",
  //   roles: [ROLES.SUPER_ADMIN, ],
  // },

  // ── Purchases ─────────────────────────────────────
  {
    id: 15,
    title: "purchases",
    icon: <MdShoppingCart />,
    group: "Finance",
    roles: [
      ROLES.INITIATOR,
      ROLES.APPROVER,
      ROLES.SUPER_ADMIN,
      ROLES.TREASURER,
      ROLES.TREASURER_TEAM,
    ],
    submenu: [
      {
        title: "overview",
        url: "/purchase",
        icon: <MdOutlineAutoGraph />,
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
        ],
      },
      {
        id: 18,
        title: "inventory",
        icon: <MdInventory />,
        url: "/inventory",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
        ],
      },
    ],
  },

  // ── Sales ─────────────────────────────────────────
  {
    id: 20,
    title: "sales",
    icon: <MdAttachMoney />,
    group: "Finance",
    roles: [
      ROLES.INITIATOR,
      ROLES.APPROVER,
      ROLES.SUPER_ADMIN,
      ROLES.TREASURER,
      ROLES.TREASURER_TEAM,
      ROLES.AUDIT,
    ],
    submenu: [
      {
        title: "overview",
        url: "/sales",
        icon: <MdOutlineAutoGraph />,
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
          ROLES.AUDIT,
        ],
      },
      {
        id: 17,
        title: "sale requisition",
        icon: <MdPointOfSale />,
        url: "/sales-requisitions",
        roles: [
          ROLES.INITIATOR,
          ROLES.APPROVER,
          ROLES.SUPER_ADMIN,
          ROLES.TREASURER,
          ROLES.TREASURER_TEAM,
        ],
      },
      {
        id: 19,
        title: "disbursement",
        icon: <FaHandHoldingUsd />,
        url: "/disbursement",
        roles: [ROLES.INITIATOR, ROLES.APPROVER, ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    id: 21,
    title: "profit & loss margin",
    icon: <MdBarChart />,
    url: "/profit-loss-margin",
    group: "Finance",
    roles: [ROLES.APPROVER, ROLES.SUPER_ADMIN],
  },

  // ── System ────────────────────────────────────────
  {
    id: "audit",
    title: "Audit",
    icon: <MdSecurity />,
    url: "/audit",
    group: "System",
    roles: [ROLES.SUPER_ADMIN, ROLES.AUDIT],
  },
];
