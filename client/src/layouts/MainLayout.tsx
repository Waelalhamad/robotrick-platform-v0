import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers";
import { ROUTES } from "../shared/constants/routes.constants";
import { Sidebar } from "../components/navigation/Sidebar";
import { TopNav } from "../components/navigation/TopNav";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

interface MainLayoutProps {
  children?: ReactNode;
}

/**
 * Main application layout component that includes the sidebar, top navigation,
 * and main content area. This layout is used for all authenticated routes.
 * Updated to use consistent light theme styling matching the Home page design.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Only redirect if we're not already on the login page
      if (location.pathname !== ROUTES.LOGIN) {
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: { from: location },
        });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading state while checking authentication - using light theme
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show nothing if not authenticated (will be redirected by the effect above)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#f9fafb]">
      {/* Sidebar - fixed to the left, full height */}
      <div className="fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area: margin-left for sidebar, vertical stack */}
      <div className="flex flex-col min-h-screen ml-64">
        {/* Top Navigation */}
        <div className="flex-shrink-0">
          <TopNav onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Content - scrollable, takes all available space, padding for spacing */}
        <main className="flex-1 overflow-y-auto bg-[#f9fafb] p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children || <Outlet />}</div>
        </main>

      </div>
    </div>
  );
};

// Ensure proper default export
export default MainLayout;
