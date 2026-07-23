import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./providers/react-query-provider";
import { RoleProvider } from "./context/role-context";

import { Inter, Poppins, Montserrat } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peniwyse",
  description: "Peniwyse",
  icons: {
    icon: "/logo2.png",
    shortcut: "/logo2.png",
    apple: "/logo2.png",
  },
};

import { ThemeProvider } from "./context/theme-context";
import { AutoLogoutHandler } from "./components/auto-logout-handler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <ReactQueryProvider>
        <RoleProvider>
          <body className="min-h-full flex flex-col">
            <ThemeProvider>
              {children}
              <AutoLogoutHandler />
            </ThemeProvider>
          </body>
        </RoleProvider>
      </ReactQueryProvider>
    </html>
  );
}

