'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase-db';
import { firebaseAuth } from '@/lib/firebase-auth';
import { use } from 'react';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const { code } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        router.push(`/login?redirect=/join/${code}`);
        return;
      }
      
      await handleJoinGroup(currentUser.email!);
    });

    return () => unsubscribe();
  }, [code, router]);

  const handleJoinGroup = async (userEmail: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await firebaseDB.validateInvite(code, userEmail);

      if (!result.valid) {
        setError(result.error || 'Invalid invite code');
        setLoading(false);
        return;
      }

      if (result.groupId) {
        await firebaseDB.addLeaderToGroup(result.groupId, userEmail);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to join group. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button className="w-full" onClick={() => router.push('/')}>
            Go Back Home
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Joined!</h1>
          <p className="text-muted-foreground mb-6">
            You've successfully joined the group. Redirecting...
          </p>
        </Card>
      </div>
    );
  }

  return null;
}
