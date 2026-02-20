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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lab Manager</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
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
          <Card className="p-12 text-center border-dashed">
            <p className="text-muted-foreground mb-4">No groups yet</p>
            <p className="text-sm text-muted-foreground">
              Create a new group or ask the group owner to invite you
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-md transition-shadow h-full relative">
                <Link href={`/group/${group.id}`} className="block">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{group.subject}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Branches: {group.branches?.join(', ') || 'N/A'}</p>
                    <p>Leaders: {group.leaders?.length || 0}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteGroup(group.id, group.name, e)}
                  className="absolute top-4 right-4 text-destructive hover:text-destructive hover:bg-destructive/10"
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
