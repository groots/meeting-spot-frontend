'use client';

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 