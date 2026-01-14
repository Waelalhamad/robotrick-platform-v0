import React from "react";
import {
  Home,
  Package,
  ShoppingCart,
  FolderOpen,
  Trophy,
  Users,
  FileText,
  Settings as SettingsIcon,
  BookOpen,
  GraduationCap,
  Calendar,
  DollarSign,
  UserPlus,
  UserCircle,
  Briefcase,
  ClipboardCheck,
  Tag,
} from "lucide-react";
import { UserRole } from "../types/auth.types";
import type { NavItem } from "../types/common.types";

/**
 * Application route paths
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/a7f9b2e4c1d8e3f6a9b0c2d5e7f1a3b8d6c9e2f4a1b7c3d9e5f8a2b4c6d1e3f7",
  REGISTER: "/register",
  INVENTORY: "/inventory",
  ORDERS: "/orders",
  PROJECTS: "/projects",
  COMPETITIONS: "/competitions",
  TEAMS: "/teams",
  POSTS: "/posts",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  NOT_FOUND: "/404",

  // Reception routes
  RECEPTION_SCHEDULE: "/reception/schedule",

  // Student routes
  STUDENT_DASHBOARD: "/student",
  STUDENT_COURSES: "/student/courses",
  STUDENT_ATTENDANCE: "/student/attendance",
  STUDENT_PAYMENTS: "/student/payments",
} as const;

/**
 * Navigation items for the sidebar/menu
 * Updated to use actual Lucide React icons instead of string references
 */
export const NAV_ITEMS: NavItem[] = [
  // Regular Dashboard (Admin, Team Lead, Member)
  {
    id: "dashboard",
    title: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: React.createElement(Home, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD, UserRole.MEMBER, UserRole.JUDGE, UserRole.EDITOR, UserRole.ORGANIZER],
  },

  // Student Dashboard
  {
    id: "student-dashboard",
    title: "My Dashboard",
    path: ROUTES.STUDENT_DASHBOARD,
    icon: React.createElement(GraduationCap, { className: "w-5 h-5" }),
    roles: [UserRole.STUDENT],
  },
  {
    id: "student-courses",
    title: "My Courses",
    path: ROUTES.STUDENT_COURSES,
    icon: React.createElement(BookOpen, { className: "w-5 h-5" }),
    roles: [UserRole.STUDENT],
  },
  {
    id: "student-attendance",
    title: "Attendance",
    path: ROUTES.STUDENT_ATTENDANCE,
    icon: React.createElement(Calendar, { className: "w-5 h-5" }),
    roles: [UserRole.STUDENT],
  },
  {
    id: "student-payments",
    title: "Payments",
    path: ROUTES.STUDENT_PAYMENTS,
    icon: React.createElement(DollarSign, { className: "w-5 h-5" }),
    roles: [UserRole.STUDENT],
  },

  // Trainer Dashboard
  {
    id: "trainer-dashboard",
    title: "Dashboard",
    path: "/trainer",
    icon: React.createElement(Home, { className: "w-5 h-5" }),
    roles: [UserRole.TRAINER, UserRole.TEACHER],
  },
  {
    id: "trainer-groups",
    title: "My Groups",
    path: "/trainer/groups",
    icon: React.createElement(Users, { className: "w-5 h-5" }),
    roles: [UserRole.TRAINER, UserRole.TEACHER],
  },
  {
    id: "trainer-sessions",
    title: "Sessions",
    path: "/trainer/sessions",
    icon: React.createElement(BookOpen, { className: "w-5 h-5" }),
    roles: [UserRole.TRAINER, UserRole.TEACHER],
  },
  {
    id: "trainer-schedule",
    title: "Schedule",
    path: "/trainer/schedule",
    icon: React.createElement(Calendar, { className: "w-5 h-5" }),
    roles: [UserRole.TRAINER, UserRole.TEACHER],
  },
  {
    id: "trainer-quizzes",
    title: "Quizzes",
    path: "/trainer/quizzes",
    icon: React.createElement(FileText, { className: "w-5 h-5" }),
    roles: [UserRole.TRAINER, UserRole.TEACHER],
  },

  // Inventory (Admin and Team Lead only)
  {
    id: "inventory",
    title: "Inventory",
    path: ROUTES.INVENTORY,
    icon: React.createElement(Package, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD],
  },

  // Orders (Not for students)
  {
    id: "orders",
    title: "Orders",
    path: ROUTES.ORDERS,
    icon: React.createElement(ShoppingCart, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD, UserRole.MEMBER],
  },

  // Projects (Not for students)
  {
    id: "projects",
    title: "Projects",
    path: ROUTES.PROJECTS,
    icon: React.createElement(FolderOpen, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD, UserRole.MEMBER],
  },

  // Competitions (Not for students)
  {
    id: "competitions",
    title: "Competitions",
    path: ROUTES.COMPETITIONS,
    icon: React.createElement(Trophy, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD, UserRole.MEMBER, UserRole.JUDGE],
  },

  // Teams (Not for students)
  {
    id: "teams",
    title: "Teams",
    path: ROUTES.TEAMS,
    icon: React.createElement(Users, { className: "w-5 h-5" }),
    roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.TEAM_LEAD, UserRole.MEMBER],
  },

  // Reception Management (Reception only)
  {
    id: "reception-dashboard",
    title: "Reception",
    path: "/reception",
    icon: React.createElement(Briefcase, { className: "w-5 h-5" }),
    roles: [UserRole.RECEPTION],
  },
  {
    id: "reception-users",
    title: "User Management",
    path: "/reception/users",
    icon: React.createElement(Users, { className: "w-5 h-5" }),
    roles: [UserRole.RECEPTION],
  },
  {
    id: "reception-enrollments",
    title: "Enrollments",
    path: "/reception/enrollments",
    icon: React.createElement(BookOpen, { className: "w-5 h-5" }),
    roles: [UserRole.RECEPTION],
  },
  {
    id: "reception-leads",
    title: "Leads",
    path: "/reception/leads",
    icon: React.createElement(UserCircle, { className: "w-5 h-5" }),
    roles: [UserRole.RECEPTION],
  },
  {
    id: "reception-schedule",
    title: "Schedule",
    path: ROUTES.RECEPTION_SCHEDULE,
    icon: React.createElement(Calendar, { className: "w-5 h-5" }),
    roles: [UserRole.RECEPTION],
  },

  // CLO Management (Chief Learning Officer only)
  {
    id: "clo-dashboard",
    title: "CLO Dashboard",
    path: "/clo",
    icon: React.createElement(Home, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-trainers",
    title: "Trainers",
    path: "/clo/trainers",
    icon: React.createElement(Users, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-courses",
    title: "Courses",
    path: "/clo/courses",
    icon: React.createElement(BookOpen, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-groups",
    title: "Groups",
    path: "/clo/groups",
    icon: React.createElement(UserPlus, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-evaluations",
    title: "Evaluations",
    path: "/clo/evaluations",
    icon: React.createElement(FileText, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-evaluation-criteria",
    title: "Evaluation Criteria",
    path: "/clo/evaluation-criteria",
    icon: React.createElement(SettingsIcon, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-attendance",
    title: "Attendance",
    path: "/clo/attendance",
    icon: React.createElement(ClipboardCheck, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },
  {
    id: "clo-interests",
    title: "Interests",
    path: "/clo/interests",
    icon: React.createElement(Tag, { className: "w-5 h-5" }),
    roles: [UserRole.CLO],
  },

  // ========================================
  // COMING SOON: Settings Feature
  // ========================================
  // Settings (Admin only)
  // {
  //   id: "settings",
  //   title: "Settings",
  //   path: ROUTES.SETTINGS,
  //   icon: React.createElement(SettingsIcon, { className: "w-5 h-5" }),
  //   roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
  // },
];

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.NOT_FOUND];

/**
 * Admin routes that require admin privileges
 */
export const ADMIN_ROUTES = [
  ROUTES.SETTINGS,
  // Add more admin routes as needed
];
