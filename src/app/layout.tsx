import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";

export const metadata: Metadata = {
  title: "PalliBazaar - Online Rural Marketplace",
  description: "Fresh farm produce, livestock, and beautiful local handicrafts directly from our village farmers.",
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
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}