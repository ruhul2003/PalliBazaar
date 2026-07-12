import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import { Toaster } from "react-hot-toast";

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
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 3500,
              style: {
                background: "#ffffff",
                color: "#222d27",
                borderRadius: "10px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 600,
                border: "1px solid #e6ece8"
              },
              success: {
                iconTheme: {
                  primary: "#2e5a44",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#c85a32",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}