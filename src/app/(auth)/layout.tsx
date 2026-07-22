export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh bg-gradient-to-br from-[#1e3a5f] via-[#2563eb] to-[#1e40af] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[800px] w-[800px] rounded-full bg-white/[0.07] blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 h-[700px] w-[700px] rounded-full bg-blue-200/[0.05] blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-white/[0.03] blur-[200px]" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-400/[0.08] blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[250px] w-[250px] rounded-full bg-indigo-400/[0.06] blur-[100px]" />
      </div>
      <div className="relative z-10 min-h-svh flex items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
