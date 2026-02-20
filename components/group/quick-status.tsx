'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Clock } from 'lucide-react';

interface QuickStatusProps {
  onStatusChange: (status: 'present' | 'absent' | 'excused') => void;
}

export default function QuickStatus({ onStatusChange }: QuickStatusProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-2">
        <Button
          onClick={() => onStatusChange('present')}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Check className="w-4 h-4" />
          Present
        </Button>
        <Button
          onClick={() => onStatusChange('absent')}
          variant="destructive"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Absent
        </Button>
        <Button
          onClick={() => onStatusChange('excused')}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <Clock className="w-4 h-4" />
          Excused
        </Button>
      </div>
    </Card>
  );
}
