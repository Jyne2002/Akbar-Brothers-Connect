import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../utils/auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userInfo = getStoredUser();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userInfo.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
