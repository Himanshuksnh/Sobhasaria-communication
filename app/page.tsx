'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateGroupDialog from '@/components/create-group-dialog';
import { firebaseAuth } from '@/lib/firebase-auth';
import { firebaseDB } from '@/lib/firebase-db';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await loadGroups(currentUser.email!);
      } else {
        router.push('/login');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadGroups = async (userEmail: string) => {
    try {
      const userGroups = await firebaseDB.getUserGroups(userEmail);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!confirm(`Are you sure you want to delete "${groupName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await firebaseDB.deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      alert('Group deleted successfully!');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleCreateGroup = async (data: {
    name: string;
    subject: string;
    branches: string[];
  }) => {
    if (!user?.email) return;

    try {
      const groupId = `group-${Date.now()}`;
      const newGroup = {
        id: groupId,
        name: data.name,
        subject: data.subject,
        sheetId: `sheet-${groupId}`,
        owners: [user.email],
        leaders: [user.email],
        branches: data.branches,
        currentBranch: data.branches[0],
        createdAt: new Date().toISOString(),
      };

      await firebaseDB.createGroup(newGroup);
      setGroups([...groups, newGroup]);
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Communication Lab
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Your Groups</h2>
            <p className="text-sm text-muted-foreground">Manage and view your lab groups</p>
          </div>
          <CreateGroupDialog onCreate={handleCreateGroup} />
        </div>

        {groups.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No groups yet</p>
              <p className="text-sm text-muted-foreground">
                Create a new group or ask the group owner to invite you
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card 
                key={group.id} 
                className="p-6 hover:shadow-2xl transition-all duration-300 h-full relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:scale-105 group"
              >
                <Link href={`/group/${group.id}`} className="block">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{group.subject}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">{group.branches?.join(', ') || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{group.leaders?.length || 0} Leaders</span>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
