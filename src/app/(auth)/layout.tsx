export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm text-white font-bold text-3xl shadow-2xl">
            N
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Nexus CRM</h1>
          <p className="text-lg text-white/70 max-w-sm">Kelola pelanggan, prospek, dan penjualan dalam satu platform terpadu</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/[0.03] via-background to-primary/[0.05] md:bg-background min-h-svh px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden text-center mb-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-xl shadow-lg">
              N
            </div>
            <h1 className="text-xl font-bold tracking-tight">Nexus CRM</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
