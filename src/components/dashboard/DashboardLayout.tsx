import { Suspense } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Suspense>
        <Sidebar />
      </Suspense>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
