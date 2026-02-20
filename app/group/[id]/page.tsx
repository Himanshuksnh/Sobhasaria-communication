'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AttendanceTable from '@/components/group/attendance-table';
import AdvancedSettings from '@/components/group/advanced-settings';
import { firebaseDB } from '@/lib/firebase-db';
import { firebaseAuth } from '@/lib/firebase-auth';
import { exportService } from '@/lib/export-service';
import { use } from 'react';

interface GroupPageProps {
  params: Promise<{ id: string }>;
}

export default function GroupPage({ params }: GroupPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        router.push('/login');
        return;
      }
      
      await loadGroupData();
    });

    return () => unsubscribe();
  }, [id, router]);

  const loadGroupData = async () => {
    try {
      const groupData = await firebaseDB.getGroup(id);
      if (groupData) {
        setGroup(groupData);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!group) return;
    await exportService.exportAttendanceToExcel(id, group.name);
  };

  const handleExportCSV = async () => {
    if (!group) return;
    await exportService.exportAttendanceToCSV(id, group.name);
  };

  const handleExportSummary = async () => {
    if (!group) return;
    await exportService.exportSummaryReport(id, group.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-4">This group doesn't exist or you don't have access.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="hover:scale-110 transition-transform">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {group.name}
                </h1>
                <p className="text-sm text-muted-foreground">{group.subject}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Group Settings & Admin</DialogTitle>
                  <DialogDescription>
                    Manage leaders, generate invites, and export data
                  </DialogDescription>
                </DialogHeader>
                <AdvancedSettings
                  groupId={group.id}
                  groupName={group.name}
                  leaders={group.leaders}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Today's Attendance
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-white dark:bg-gray-700 text-foreground text-sm shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              </div>
            </Card>

            <AttendanceTable groupId={id} date={selectedDate} />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Export Attendance Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download attendance records in different formats
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  onClick={handleExportExcel} 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={handleExportCSV} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export to CSV
                </Button>
                <Button 
                  onClick={handleExportSummary} 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export Summary Report
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Group Leaders</h3>
              <div className="space-y-3">
                {group.leaders.map((leader) => (
                  <div key={leader} className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="text-sm text-foreground">{leader}</span>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
