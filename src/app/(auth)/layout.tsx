export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-primary/90 via-primary to-[#003d8a] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-300/5 blur-[120px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-white shadow-2xl">
            <span className="text-2xl font-bold">N</span>
          </div>
          <h2 className="text-white text-[1.75rem] font-bold tracking-tight mb-4">Nexus CRM</h2>
          <p className="text-white/60 text-[0.9rem] leading-relaxed max-w-[280px] mx-auto">
            Kelola pelanggan, prospek, dan penjualan tim Anda dalam satu platform.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f9fafb] min-h-svh px-6 md:px-10 py-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              N
            </div>
            <span className="text-[0.95rem] font-semibold tracking-tight text-[#111827]">Nexus CRM</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
