import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionProvider>
  );
}
