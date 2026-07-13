export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070707] text-[#eaeaea] font-body">
      <div className="max-w-5xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
