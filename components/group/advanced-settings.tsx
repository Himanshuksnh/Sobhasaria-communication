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
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Current Leaders</h3>
          <div className="space-y-3">
            {leaders.map((leader) => (
              <div key={leader} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="text-sm text-foreground">{leader}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLeader(leader)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Add New Leader</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newLeaderEmail}
              onChange={(e) => setNewLeaderEmail(e.target.value)}
            />
            <Button onClick={handleAddLeader}>Add</Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="invites" className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Generate Invite Link</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a new invite code to share with others (valid for 7 days)
          </p>
          <Button onClick={handleGenerateInvite} disabled={isGenerating} className="mb-4">
            {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate New Invite'}
          </Button>
          
          {inviteCode && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Share this link:</h4>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-muted rounded text-sm text-foreground font-mono break-all">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`}
                </code>
                <Button onClick={handleCopyInvite}>
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
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
