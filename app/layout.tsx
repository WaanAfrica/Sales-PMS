import type { Metadata } from "next";
import "@/src/app/globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sales PMS",
  description: "Sales performance management system",
  icons: {
    icon: "/assets/company/logo.jpeg",
    shortcut: "/assets/company/logo.jpeg",
    apple: "/assets/company/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
