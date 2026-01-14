import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { ROUTES } from '../../shared/constants/routes.constants';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
