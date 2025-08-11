import DashboardHeader from "@/components/dashboard/Header";
import { DashboardSidebar } from "@/components/dashboard/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-muted">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
