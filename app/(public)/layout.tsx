export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <div className="flex-1">{children}</div>
      <footer className="border-t border-neutral-200 py-6">
        <p className="text-center text-xs text-neutral-400">
          Seguimiento de trámites · NotarTrack
        </p>
      </footer>
    </div>
  );
}
