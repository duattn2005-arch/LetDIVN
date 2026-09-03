import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { useAuth } from '../context/AuthContext';

interface DatabaseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseAdminModal: React.FC<DatabaseAdminModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  return <AdminDashboard isOpen={isOpen && isAdmin} onClose={onClose} />;
};

export { AdminDashboard };


