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

interface AdvancedSettingsProps {
  groupId: string;
  groupName: string;
  leaders: string[];
}

export default function AdvancedSettings({
  groupId,
  groupName,
  leaders,
}: AdvancedSettingsProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [newLeaderEmail, setNewLeaderEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleAddLeader = async () => {
    if (!newLeaderEmail.trim()) return;
    
    try {
      await firebaseDB.addLeaderToGroup(groupId, newLeaderEmail.trim());
      alert('Leader added successfully!');
      setNewLeaderEmail('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding leader:', error);
      alert('Failed to add leader');
    }
  };

  const handleRemoveLeader = async (email: string) => {
    if (!confirm(`Remove ${email} as a leader?`)) return;
    
    try {
      const group = await firebaseDB.getGroup(groupId);
      if (group) {
        const updatedLeaders = group.leaders.filter(l => l !== email);
        await firebaseDB.updateGroup(groupId, { leaders: updatedLeaders });
        alert('Leader removed successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error removing leader:', error);
      alert('Failed to remove leader');
    }
  };

  const handleExportData = async () => {
    await exportService.exportAttendanceToCSV(groupId, groupName);
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await firebaseDB.deleteGroup(groupId);
      alert('Group deleted successfully!');
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  return (
    <Tabs defaultValue="leaders" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="leaders">Leaders</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      <TabsContent value="leaders" className="space-y-4">
        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground text-lg">Current Leaders</h3>
          </div>
          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div key={leader} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {leader.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{leader}</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLeader(leader)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0">
          <h3 className="font-semibold text-foreground mb-2">Add New Leader (Direct)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a leader directly by email (they must have an account)
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newLeaderEmail}
              onChange={(e) => setNewLeaderEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleAddLeader}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Add
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="invites" className="space-y-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg mb-2">Add Co-Leader via Invite Link</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a secure invite link to add another leader to this group. The link is valid for 7 days and can only be used once.
              </p>
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>How it works:</strong>
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 ml-4 list-decimal">
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isGenerating ? 'Generating...' : '✨ Generate New Invite'}
              </Button>
            </div>
          </div>
          
          {inviteCode && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">Invite Link Generated!</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Share this link with your co-leader:</p>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-foreground font-mono break-all border border-gray-300 dark:border-gray-600">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`}
                </code>
                <Button 
                  onClick={handleCopyInvite}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                >
                  <Copy className="w-4 h-4 mr-2" />
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

      <TabsContent value="danger" className="space-y-4">
        <Card className="p-6 border-destructive/20">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-2">Delete Group</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete the group and all its data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteGroup}
              >
                Delete Group
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-2">Export Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all attendance records as a CSV file
          </p>
          <Button variant="outline" onClick={handleExportData}>
            Export CSV
          </Button>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
