import { useState, useEffect } from 'react';

export interface UserPermissions {
  canManageUsers: boolean;
  canViewReports: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canAssignTickets: boolean;
  [key: string]: boolean;
}

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  permissions: UserPermissions;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    role: user?.role,
    isAdmin: user?.role === 'Admin',
    isProjectManager: user?.role === 'ProjectManager',
    isLoading
  };
};

export const usePermissions = () => {
  const { user } = useAuth();

  // Default permissions if none found
  const defaultPermissions: UserPermissions = {
    canManageUsers: false,
    canViewReports: false,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canAssignTickets: false,
  };

  return user?.permissions || defaultPermissions;
};
