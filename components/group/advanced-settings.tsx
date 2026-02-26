'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, Trash2, Loader2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase-db';
import { firebaseAuth } from '@/lib/firebase-auth';
import { exportService } from '@/lib/export-service';
import ThemeToggle from '@/components/theme-toggle';

interface AdvancedSettingsProps {
  groupId: string;
  groupName: string;
  leaders: string[];
  branches?: string[];
  group: any;
  userEmail: string;
}

export default function AdvancedSettings({
  groupId,
  groupName,
  leaders,
  branches = [],
  group,
  userEmail,
}: AdvancedSettingsProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [groupBranches, setGroupBranches] = useState<string[]>(branches);
  const [newBranch, setNewBranch] = useState('');
  
  // Leaders (special students) state
  const [specialLeaders, setSpecialLeaders] = useState<any[]>([]);
  const [newLeader, setNewLeader] = useState({ email: '', rollNo: '', name: '', branch: '' });
  
  // Teachers state
  const [groupTeachers, setGroupTeachers] = useState<string[]>(group?.teacherEmails || []);
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  
  // Check if user is teacher
  const masterTeacherEmail = process.env.NEXT_PUBLIC_MASTER_TEACHER_EMAIL?.toLowerCase();
  const isMasterTeacher = userEmail.toLowerCase() === masterTeacherEmail;
  const isGroupTeacher = group?.teacherEmails?.some((email: string) => 
    email.toLowerCase() === userEmail.toLowerCase()
  );
  const isTeacher = isMasterTeacher || isGroupTeacher;

  // Load special leaders on mount
  useEffect(() => {
    loadSpecialLeaders();
  }, [groupId]);

  const loadSpecialLeaders = async () => {
    try {
      const leaders = await firebaseDB.getGroupLeaders(groupId);
      setSpecialLeaders(leaders);
    } catch (error) {
      console.error('Error loading leaders:', error);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranch.trim()) return;
    
    if (groupBranches.includes(newBranch.trim())) {
      alert('This branch already exists');
      return;
    }
    
    try {
      const updatedBranches = [...groupBranches, newBranch.trim()];
      await firebaseDB.updateGroup(groupId, { branches: updatedBranches });
      setGroupBranches(updatedBranches);
      setNewBranch('');
      alert('Branch added successfully!');
    } catch (error) {
      console.error('Error adding branch:', error);
      alert('Failed to add branch');
    }
  };

  const handleRemoveBranch = async (branch: string) => {
    if (!confirm(`Remove "${branch}" branch? Students in this branch will not be deleted.`)) return;
    
    try {
      const updatedBranches = groupBranches.filter(b => b !== branch);
      await firebaseDB.updateGroup(groupId, { branches: updatedBranches });
      setGroupBranches(updatedBranches);
      alert('Branch removed successfully!');
    } catch (error) {
      console.error('Error removing branch:', error);
      alert('Failed to remove branch');
    }
  };

  // Leader (special student) handlers
  const handleAddLeader = async () => {
    if (!newLeader.email.trim() || !newLeader.rollNo.trim() || !newLeader.name.trim() || !newLeader.branch.trim()) {
      alert('Please fill all leader fields');
      return;
    }

    try {
      await firebaseDB.addLeader(groupId, newLeader);
      await loadSpecialLeaders();
      setNewLeader({ email: '', rollNo: '', name: '', branch: '' });
      alert('Leader added successfully!');
    } catch (error) {
      console.error('Error adding leader:', error);
      alert('Failed to add leader');
    }
  };

  const handleRemoveLeader = async (email: string) => {
    if (!confirm('Remove this leader?')) return;

    try {
      await firebaseDB.deleteLeader(groupId, email);
      await loadSpecialLeaders();
      alert('Leader removed successfully!');
    } catch (error) {
      console.error('Error removing leader:', error);
      alert('Failed to remove leader');
    }
  };

  // Teacher handlers (only for master teacher)
  const handleAddTeacher = async () => {
    if (!newTeacherEmail.trim()) return;

    try {
      const updatedTeachers = [...groupTeachers, newTeacherEmail.trim().toLowerCase()];
      await firebaseDB.updateGroup(groupId, { teacherEmails: updatedTeachers });
      setGroupTeachers(updatedTeachers);
      setNewTeacherEmail('');
      alert('Teacher added successfully!');
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher');
    }
  };

  const handleRemoveTeacher = async (email: string) => {
    if (!confirm('Remove this teacher?')) return;

    try {
      const updatedTeachers = groupTeachers.filter(t => t !== email);
      await firebaseDB.updateGroup(groupId, { teacherEmails: updatedTeachers });
      setGroupTeachers(updatedTeachers);
      alert('Teacher removed successfully!');
    } catch (error) {
      console.error('Error removing teacher:', error);
      alert('Failed to remove teacher');
    }
  };

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const userEmail = firebaseAuth.getUserEmail();
      if (!userEmail) {
        alert('You must be logged in to generate invites');
        return;
      }
      
      const code = await firebaseDB.generateInvite(groupId, userEmail);
      setInviteCode(code);
      alert('Invite code generated successfully!');
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Failed to generate invite code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteCode) {
      alert('Please generate an invite code first');
      return;
    }
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddManager = async () => {
    if (!newLeaderEmail.trim()) return;
    
    try {
      await firebaseDB.addLeaderToGroup(groupId, newLeaderEmail.trim());
      alert('Manager added successfully!');
      setNewLeaderEmail('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding manager:', error);
      alert('Failed to add manager');
    }
  };

  const handleRemoveManager = async (email: string) => {
    if (!confirm(`Remove ${email} as a manager?`)) return;
    
    try {
      const group = await firebaseDB.getGroup(groupId);
      if (group) {
        const updatedLeaders = group.leaders.filter(l => l !== email);
        await firebaseDB.updateGroup(groupId, { leaders: updatedLeaders });
        alert('Manager removed successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error removing manager:', error);
      alert('Failed to remove manager');
    }
  };

  const handleExportData = async () => {
    await exportService.exportAttendanceToCSV(groupId, groupName);
  };

  const handleDeleteGroup = async () => {
    // Step 1: Show warning and ask for email confirmation
    const userEmail = firebaseAuth.getUserEmail();
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
      
      alert(
        `✅ Group "${groupName}" deleted successfully!\n\n` +
        `📁 Backup data has been downloaded to your device.\n` +
        `Check your Downloads folder.`
      );
      
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('❌ Failed to delete group. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Theme Toggle at Top Left */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Theme:</span>
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue={isMasterTeacher ? "teachers" : "student-leaders"} className="w-full space-y-4 sm:space-y-6">
      <TabsList className={`grid w-full ${isMasterTeacher ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {isMasterTeacher && (
          <TabsTrigger value="teachers" className="text-xs sm:text-sm">Teachers</TabsTrigger>
        )}
        {isTeacher && (
          <TabsTrigger value="student-leaders" className="text-xs sm:text-sm">Leaders</TabsTrigger>
        )}
        <TabsTrigger value="managers" className="text-xs sm:text-sm">Managers</TabsTrigger>
        <TabsTrigger value="branches" className="text-xs sm:text-sm">Branches</TabsTrigger>
        <TabsTrigger value="invites" className="text-xs sm:text-sm">Invites</TabsTrigger>
        <TabsTrigger value="danger" className="text-xs sm:text-sm">Danger</TabsTrigger>
      </TabsList>

      {/* Teachers Tab - Only for Master Teacher */}
      {isMasterTeacher && (
        <TabsContent value="teachers" className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-lg mb-4">Group-Specific Teachers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add teachers who can manage this group and its leaders.
            </p>
            
            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                placeholder="teacher@example.com"
                value={newTeacherEmail}
                onChange={(e) => setNewTeacherEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddTeacher}>Add Teacher</Button>
            </div>

            <div className="space-y-2">
              {groupTeachers.map((teacher) => (
                <div key={teacher} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{teacher}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTeacher(teacher)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {groupTeachers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No group-specific teachers added yet
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      )}

      {/* Student Leaders Tab - Only for Teachers */}
      {isTeacher && (
        <TabsContent value="student-leaders" className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold text-lg mb-4">Special Student Leaders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add students as leaders. They will have special privileges and their attendance will be tracked separately.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Input
                type="email"
                placeholder="Email"
                value={newLeader.email}
                onChange={(e) => setNewLeader({...newLeader, email: e.target.value})}
              />
              <Input
                placeholder="Roll No"
                value={newLeader.rollNo}
                onChange={(e) => setNewLeader({...newLeader, rollNo: e.target.value})}
              />
              <Input
                placeholder="Name"
                value={newLeader.name}
                onChange={(e) => setNewLeader({...newLeader, name: e.target.value})}
              />
              <select
                value={newLeader.branch}
                onChange={(e) => setNewLeader({...newLeader, branch: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Branch</option>
                {groupBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddLeader} className="w-full sm:w-auto">Add Leader</Button>

            <div className="space-y-2 mt-4">
              {specialLeaders.map((leader) => (
                <div key={leader.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{leader.name}</p>
                    <p className="text-sm text-muted-foreground">{leader.rollNo} • {leader.branch} • {leader.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLeader(leader.email)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {specialLeaders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No student leaders added yet
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      )}

      {/* Managers Tab - Renamed from Leaders */}
      <TabsContent value="managers" className="space-y-3 sm:space-y-4">
        <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground text-base sm:text-lg">Group Managers</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {leaders.map((leader, index) => (
              <div key={leader} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                    {leader.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{leader}</span>
                    {index === 0 && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveManager(leader)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Add New Manager</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Add a manager by email (they can manage students)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newLeaderEmail}
              onChange={(e) => setNewLeaderEmail(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={handleAddManager}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto text-sm"
            >
              Add
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="branches" className="space-y-3 sm:space-y-4">
        <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground text-base sm:text-lg">Current Branches</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {groupBranches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No branches added yet</p>
            ) : (
              groupBranches.map((branch) => (
                <div key={branch} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                      {branch.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">{branch}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBranch(branch)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Add New Branch</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Add a new branch to organize students (e.g., Data Science, Electrical, CSE)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Branch name (e.g., Data Science)"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBranch();
                }
              }}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={handleAddBranch}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 w-full sm:w-auto text-sm"
            >
              Add Branch
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="invites" className="space-y-3 sm:space-y-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1.5 sm:mb-2">Add Co-Leader via Invite Link</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Generate a secure invite link to add another leader to this group. The link is valid for 7 days and can only be used once.
              </p>
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1.5 sm:mb-2">
                  How it works:
                </p>
                <ol className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 space-y-0.5 sm:space-y-1 ml-4 list-decimal">
                  <li>Click "Generate New Invite" button</li>
                  <li>Copy the generated link</li>
                  <li>Share it with your co-leader via WhatsApp/Email</li>
                  <li>They click the link and login</li>
                  <li>They automatically become a co-leader!</li>
                </ol>
              </div>
              <Button 
                onClick={handleGenerateInvite} 
                disabled={isGenerating} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm"
              >
                {isGenerating && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />}
                {isGenerating ? 'Generating...' : '✨ Generate New Invite'}
              </Button>
            </div>
          </div>
          
          {inviteCode && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">Invite Link Generated!</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2 sm:mb-3">Share this link with your co-leader:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="flex-1 p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm text-foreground font-mono break-all border border-gray-300 dark:border-gray-600">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`}
                </code>
                <Button 
                  onClick={handleCopyInvite}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md w-full sm:w-auto text-sm"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {copiedCode ? '✓ Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⏰ This link expires in 7 days and can only be used once.
              </p>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="danger" className="space-y-3 sm:space-y-4">
        <Card className="p-4 sm:p-6 border-destructive/20">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1.5 sm:mb-2 text-sm sm:text-base">Delete Group</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                This will permanently delete the group and all its data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteGroup}
                className="w-full sm:w-auto text-sm"
              >
                Delete Group
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">Export Data</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Download all attendance records as a CSV file
          </p>
          <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto text-sm">
            Export CSV
          </Button>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  );
}
