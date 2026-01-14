import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES, NAV_ITEMS } from '../../shared/constants/routes.constants';
import { useAuth } from '../../providers';
import { UserRole } from '../../shared/types/auth.types';
import { LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Premium Sidebar with Light Mode - Professional Design
 * Redesigned to match Home page aesthetics
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Filter nav items based on user role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    if (!isAuthenticated) return false;
    return item.roles.includes(user?.role as UserRole);
  });

  // Close sidebar when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile Backdrop with Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar with Light Theme */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto
                    bg-white
                    border-r border-primary/10
                    shadow-lg
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className="flex h-20 items-center justify-center border-b border-primary/10 px-4 py-3
                       bg-gradient-to-r from-primary/5 via-accent/5 to-transparent"
          >
            <Link to={ROUTES.HOME} className="flex items-center justify-center group w-full">
              <img
                src="/logo.png"
                alt="Robotric Logo"
                className="h-16 w-auto max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Navigation with Stagger Animation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNavItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavItem
                  to={item.path}
                  label={item.title}
                  icon={item.icon}
                  isActive={location.pathname === item.path}
                  onClick={handleLinkClick}
                />
              </motion.div>
            ))}
          </nav>

          {/* Premium User Section */}
          <div className="border-t border-primary/10 p-4 bg-gradient-to-b from-transparent to-primary/5">
            {user && (
              <div className="space-y-3">
                {/* User Info Card */}
                {/* Profile link disabled - Coming Soon feature */}
                {/* <Link to={ROUTES.PROFILE} onClick={handleLinkClick}> */}
                  <div className="flex items-center p-3 rounded-xl
                               bg-white
                               border border-primary/20"
                  >
                    <div className="relative">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full
                                      bg-gradient-to-br from-primary to-[#004d00]
                                      flex items-center justify-center
                                      shadow-md">
                        <span className="text-[#ffffcc] font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                                      bg-green-500 rounded-full border-2 border-white
                                      shadow-sm" />
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#003300] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[#003300]/60 capitalize flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {user.role}
                      </p>
                    </div>
                  </div>
                {/* </Link> */}

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl
                             bg-red-50 border border-red-200
                             hover:bg-red-100 hover:border-red-300
                             text-red-600 hover:text-red-700
                             transition-all duration-300
                             font-medium text-sm group"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Premium Navigation Item with Light Mode
 */
const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive, onClick }) => {
  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-all duration-300 relative overflow-hidden group
                    ${isActive
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm'
                      : 'text-[#003300]/70 hover:text-primary hover:bg-primary/5'
                    }`}
      >
        {/* Hover Background Effect */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        )}

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-[#004d00] rounded-r-full"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Icon */}
        {icon && (
          <span className={`mr-3 flex-shrink-0 relative z-10
                            ${isActive ? 'text-primary' : 'text-[#003300]/60 group-hover:text-primary'}
                            transition-all duration-300`}>
            {icon}
          </span>
        )}

        {/* Label */}
        <span className="truncate relative z-10">{label}</span>

        {/* Chevron on Active */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

export default Sidebar;
