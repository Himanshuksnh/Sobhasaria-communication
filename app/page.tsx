'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Trash2, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateGroupDialog from '@/components/create-group-dialog';
import ThemeToggle from '@/components/theme-toggle';
import { firebaseAuth } from '@/lib/firebase-auth';
import { firebaseDB } from '@/lib/firebase-db';
import { exportService } from '@/lib/export-service';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');

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
      
      // Get current academic year (e.g., if 2026, then 2025-26)
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
      
      // Add default year for old groups that don't have year field
      const groupsWithYear = userGroups.map(group => ({
        ...group,
        year: group.year || academicYear // Default to current academic year
      }));
      
      setGroups(groupsWithYear);
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
    
    // Step 1: Show warning and ask for email confirmation
    const userEmail = user?.email;
    if (!userEmail) {
      alert('You must be logged in to delete a group');
      return;
    }

    const confirmEmail = prompt(
      `⚠️ WARNING: This will permanently delete "${groupName}" and all its data!\n\n` +
      `To confirm deletion, please type your email address:\n${userEmail}`
    );

    if (!confirmEmail) {
      return; // User cancelled
    }

    if (confirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
      alert('❌ Email does not match. Deletion cancelled for safety.');
      return;
    }

    // Step 2: Final confirmation
    const finalConfirm = confirm(
      `🚨 FINAL CONFIRMATION\n\n` +
      `Group: "${groupName}"\n` +
      `This action CANNOT be undone!\n\n` +
      `Before deletion, we will download all data as backup.\n\n` +
      `Click OK to proceed with deletion.`
    );

    if (!finalConfirm) {
      return;
    }

    try {
      // Step 3: Export data before deletion
      alert('📥 Downloading backup data...');
      await exportService.exportAttendanceToExcel(groupId, groupName);
      
      // Give time for download to start
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Delete the group
      await firebaseDB.deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      
      alert(
        `✅ Group "${groupName}" deleted successfully!\n\n` +
        `📁 Backup data has been downloaded to your device.\n` +
        `Check your Downloads folder.`
      );
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('❌ Failed to delete group. Please try again.');
    }
  };

  const handleCreateGroup = async (data: {
    name: string;
    subject: string;
    branches: string[];
    year: string;
  }) => {
    if (!user?.email) return;

    try {
      const groupId = `group-${Date.now()}`;
      const newGroup = {
        id: groupId,
        name: data.name,
        subject: data.subject,
        year: data.year,
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

  // Filter groups based on search query and year
  const uniqueYears = [...new Set(groups.map(g => g.year).filter(Boolean))].sort().reverse();
  
  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.branches?.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesYear = selectedYear === 'All' || group.year === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Communication Lab
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 flex-shrink-0"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Your Groups</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage and view your lab groups</p>
          </div>
          <CreateGroupDialog onCreate={handleCreateGroup} />
        </div>

        {/* Search Bar & Year Filter */}
        {groups.length > 0 && (
          <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups by name, subject, or branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="flex-shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Year Filter */}
              {uniqueYears.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Year:</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedYear === 'All' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedYear('All')}
                      className="text-xs"
                    >
                      All ({groups.length})
                    </Button>
                    {uniqueYears.map(year => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedYear(year)}
                        className="text-xs"
                      >
                        {year} ({groups.filter(g => g.year === year).length})
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Results Count */}
              {(searchQuery || selectedYear !== 'All') && (
                <p className="text-xs text-muted-foreground">
                  Found {filteredGroups.length} of {groups.length} groups
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedYear !== 'All' && ` in year ${selectedYear}`}
                </p>
              )}
            </div>
          </Card>
        )}

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
        ) : filteredGroups.length === 0 ? (
          <Card className="p-12 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No groups found</p>
              <p className="text-sm text-muted-foreground mb-4">
                No groups match "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{group.year || 'N/A'}</span>
                    </div>
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
