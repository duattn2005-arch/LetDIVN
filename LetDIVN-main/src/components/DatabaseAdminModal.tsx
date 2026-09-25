import React from 'react';
import { AdminDashboard } from './AdminDashboard';

interface DatabaseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseAdminModal: React.FC<DatabaseAdminModalProps> = ({ isOpen, onClose }) => {
  return <AdminDashboard isOpen={isOpen} onClose={onClose} />;
};

export { AdminDashboard };


