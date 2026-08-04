import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Sales PMS",
  description: "Administrator dashboard for Sales PMS",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
