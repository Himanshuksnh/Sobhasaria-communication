'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface CreateGroupDialogProps {
  onCreate: (data: {
    name: string;
    subject: string;
    branches: string[];
  }) => Promise<void>;
}

export default function CreateGroupDialog({ onCreate }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [branchInput, setBranchInput] = useState('');

  const handleAddBranch = () => {
    if (branchInput.trim() && !branches.includes(branchInput.trim())) {
      setBranches([...branches, branchInput.trim()]);
      setBranchInput('');
    }
  };

  const handleRemoveBranch = (branch: string) => {
    setBranches(branches.filter((b) => b !== branch));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !subject.trim() || branches.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await onCreate({
        name: name.trim(),
        subject: subject.trim(),
        branches,
      });

      // Reset form
      setName('');
      setSubject('');
      setBranches([]);
      setBranchInput('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Set up a new lab group or class
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Group Name
            </label>
            <Input
              placeholder="Lab 1 - Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject/Course
            </label>
            <Input
              placeholder="Physics 101"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Lab Branches
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Branch name (e.g., Data Science, A, Section A)"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBranch();
                  }
                }}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddBranch}
                disabled={loading}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {branches.map((branch) => (
                <div
                  key={branch}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm"
                >
                  {branch}
                  <button
                    type="button"
                    onClick={() => handleRemoveBranch(branch)}
                    className="font-bold hover:opacity-70 transition-opacity"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
