import type { Metadata } from "next";
import "./globals.css";
import "@/styles/ux.css";
import "@/utils/polyfills";
import AppProviders from "./providers";
import StoreProvider from "./StoreProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import { ChatButton } from "@/components/chat";

export const metadata: Metadata = {
  title: "AHNI ERP System",
  description: "Enterprise Resource Planning System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthProvider>
            <AppProviders>
              {children}
              <ChatButton />
            </AppProviders>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}