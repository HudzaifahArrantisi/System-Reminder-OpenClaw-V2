import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DEFAULT_PATH, type AppRole } from '../config/roleConfig';

interface RoleRouteProps {
  allow: AppRole[];
}

export default function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULT_PATH[user.role]} replace />;
  }

  return <Outlet />;
}
