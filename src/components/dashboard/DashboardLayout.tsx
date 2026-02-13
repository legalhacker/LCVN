import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import InsightPanel from "./InsightPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>

          {/* Right insight panel */}
          <InsightPanel />
        </div>
      </div>
    </div>
  );
}
