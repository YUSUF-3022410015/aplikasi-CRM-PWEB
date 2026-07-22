export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh bg-gradient-to-br from-primary/90 via-primary to-blue-900 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 h-[600px] w-[600px] rounded-full bg-white/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 -right-40 h-[500px] w-[500px] rounded-full bg-blue-300/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-white/[0.03] blur-[150px]" />
      </div>
      <div className="relative z-10 min-h-svh flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
