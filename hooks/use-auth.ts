import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  groups: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedGroups = localStorage.getItem('userGroups');

    if (storedEmail) {
      setUser({
        email: storedEmail,
        groups: storedGroups ? JSON.parse(storedGroups) : [],
      });
    }

    setIsLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    localStorage.setItem('userEmail', email);
    setUser({
      email,
      groups: [],
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGroups');
    setUser(null);
  }, []);

  const addGroup = useCallback((groupId: string) => {
    if (!user) return;

    const groups = user.groups.includes(groupId) ? user.groups : [...user.groups, groupId];
    localStorage.setItem('userGroups', JSON.stringify(groups));
    setUser({
      ...user,
      groups,
    });
  }, [user]);

  const removeGroup = useCallback((groupId: string) => {
    if (!user) return;

    const groups = user.groups.filter((id) => id !== groupId);
    localStorage.setItem('userGroups', JSON.stringify(groups));
    setUser({
      ...user,
      groups,
    });
  }, [user]);

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
    addGroup,
    removeGroup,
  };
}
