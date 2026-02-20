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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
              <p className="text-sm text-muted-foreground">{group.subject}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Group Settings & Admin</DialogTitle>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Today's Attendance</h2>
                <p className="text-sm text-muted-foreground">
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
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                />
              </div>
            </div>

            <AttendanceTable groupId={id} date={selectedDate} />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card className="p-8">
              <h3 className="font-semibold text-foreground mb-4">Export Attendance Data</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Download attendance records in different formats
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExportExcel} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export to Excel
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export to CSV
                </Button>
                <Button onClick={handleExportSummary} variant="outline" className="flex items-center gap-2">
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
