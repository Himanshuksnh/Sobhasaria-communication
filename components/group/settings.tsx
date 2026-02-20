'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GroupSettingsProps {
  groupId: string;
}

export default function GroupSettings({ groupId }: GroupSettingsProps) {
  const [name, setName] = useState('Lab 1 - Physics');
  const [subject, setSubject] = useState('Physics');
  const [branches, setBranches] = useState(['A', 'B', 'C']);
  const [branchInput, setBranchInput] = useState('');

  const handleAddBranch = () => {
    if (branchInput && !branches.includes(branchInput.toUpperCase())) {
      setBranches([...branches, branchInput.toUpperCase()]);
      setBranchInput('');
    }
  };

  const handleRemoveBranch = (branch: string) => {
    setBranches(branches.filter((b) => b !== branch));
  };

  const handleSave = async () => {
    // TODO: Save settings via API
    console.log({ name, subject, branches });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Group Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Subject/Branch
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Lab Branches
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value.toUpperCase())}
            placeholder="Branch (e.g., A)"
            maxLength={1}
          />
          <Button variant="outline" onClick={handleAddBranch}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {branches.map((branch) => (
            <div key={branch} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {branch}
              <button
                onClick={() => handleRemoveBranch(branch)}
                className="font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
