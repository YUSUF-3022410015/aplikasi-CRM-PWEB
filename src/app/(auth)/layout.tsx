export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-800" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-1/4 -left-20 h-[400px] w-[400px] rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 h-[300px] w-[300px] rounded-full bg-blue-300/5 blur-[100px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-white/15 backdrop-blur text-white shadow-2xl ring-1 ring-white/20">
            <span className="text-3xl font-bold">N</span>
          </div>
          <h2 className="text-white text-[1.75rem] font-bold tracking-tight mb-4">Nexus CRM</h2>
          <p className="text-white/50 text-[0.9rem] leading-relaxed max-w-[260px] mx-auto">
            Customer Relationship Management untuk tim sales Anda
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background min-h-svh px-6 py-8">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
