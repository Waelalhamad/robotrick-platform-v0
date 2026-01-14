import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, User, Settings, LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../providers';
import { ROUTES } from '../../shared/constants/routes.constants';
import { Badge } from '../ui';

interface TopNavProps {
  onMenuClick: () => void;
}

/**
 * Premium TopNav with Light Mode - Professional Design
 * Redesigned to match Home page aesthetics
 */
export const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Mock notifications count
  const unreadNotifications = 3;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]') && !target.closest('[data-notifications-menu]')) {
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show on auth pages
  if ([ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME].includes(location.pathname)) {
    return null;
  }

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: scrolled
          ? '0 4px 16px rgba(0, 51, 0, 0.08)'
          : '0 1px 3px rgba(0, 51, 0, 0.05)',
      }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 backdrop-blur-xl border-b border-primary/10"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left section: Mobile menu button */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile Menu Button with Animation */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="rounded-xl p-2.5 text-[#003300]/60 hover:text-primary hover:bg-primary/5
                         border border-transparent hover:border-primary/20
                         lg:hidden transition-all duration-300"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Right section: Notifications and User Menu */}
          <div className="flex items-center gap-2">
            {/* ========================================
                COMING SOON: Notifications Feature
                ======================================== */}
            {/* Notifications with Dropdown */}
            {/* <div className="relative" data-notifications-menu>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="relative rounded-xl p-2.5 text-[#003300]/60 hover:text-primary hover:bg-primary/5
                           border border-transparent hover:border-primary/20
                           focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-300"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                title="View notifications"
              >
                <Bell className="h-5 w-5" />

                {unreadNotifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
                               flex items-center justify-center border-2 border-white
                               shadow-md"
                  >
                    <span className="text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl
                               bg-white border border-primary/20
                               shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#003300]">Notifications</h3>
                        <Badge variant="primary" size="sm">{unreadNotifications} New</Badge>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          whileHover={{ backgroundColor: 'rgba(0, 51, 0, 0.03)' }}
                          className="px-4 py-3 border-b border-primary/5 cursor-pointer transition-colors"
                          onClick={() => {
                            navigate('/notifications');
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#003300] font-medium">New order received</p>
                              <p className="text-xs text-[#003300]/60 mt-0.5">Order #123{i} needs attention</p>
                              <p className="text-xs text-[#003300]/40 mt-1">{i}h ago</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(0, 51, 0, 0.05)' }}
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm font-medium text-primary
                                 border-t border-primary/10 transition-colors"
                    >
                      View all notifications
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}

            {/* User Menu */}
            <div className="relative" data-user-menu>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="flex items-center gap-2 rounded-xl bg-white
                           border border-primary/20 pl-2 pr-3 py-1.5
                           hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/20
                           transition-all duration-300"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                {/* Avatar with Gradient */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[#004d00]
                                flex items-center justify-center shadow-md
                                flex-shrink-0">
                  <span className="text-sm font-bold text-[#ffffcc]">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>

                {/* User Name (Hidden on mobile) */}
                <span className="hidden md:block text-sm font-medium text-[#003300] truncate max-w-[120px]">
                  {user?.name || 'User'}
                </span>

                {/* Dropdown Icon */}
                <motion.div
                  animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-[#003300]/60" />
                </motion.div>
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl
                               bg-white border border-primary/20
                               shadow-xl overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                      <p className="text-sm font-bold text-[#003300] truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-[#003300]/60 capitalize flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {user?.role || 'member'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {/* ========================================
                          COMING SOON: Profile & Settings Features
                          ======================================== */}
                      {/* <MenuItem
                        icon={<User className="w-4 h-4" />}
                        label="Your Profile"
                        onClick={() => {
                          navigate(ROUTES.PROFILE);
                          setIsUserMenuOpen(false);
                        }}
                      />

                      <MenuItem
                        icon={<Settings className="w-4 h-4" />}
                        label="Settings"
                        onClick={() => {
                          navigate(ROUTES.SETTINGS);
                          setIsUserMenuOpen(false);
                        }}
                      /> */}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-primary/10">
                      <MenuItem
                        icon={<LogOut className="w-4 h-4" />}
                        label="Sign out"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        variant="danger"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

/**
 * Premium Menu Item Component
 */
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, variant = 'default' }) => {
  return (
    <motion.button
      whileHover={{ x: 4, backgroundColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 51, 0, 0.03)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${variant === 'danger'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-[#003300]/70 hover:text-primary'
                  }`}
    >
      <span className={variant === 'danger' ? 'text-red-500' : 'text-[#003300]/60'}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

export default TopNav;
