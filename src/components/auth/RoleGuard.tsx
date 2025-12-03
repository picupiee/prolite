import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../../store/useAuthStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
