import { ReactNode } from 'react';

interface GroupLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function GroupLayout({
  children,
  params,
}: GroupLayoutProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
