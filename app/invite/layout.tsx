import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invite - TradeBlottr",
  openGraph: {
    images: ["/meta-tag.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/meta-tag.png"],
  },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden w-full transition-colors duration-300">
      {/* Top Left Gradient */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Bottom Right Gradient */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center ">
          <div className="w-10 h-10  flex items-center justify-center p-1.5">
            <Image
              src="/logo-white.png"
              alt="TradeBlottr Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="text-[22px] font-semibold text-foreground tracking-tight hidden sm:block">
            TradeBlott<span className="text-accent font-bold">r</span>
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <button className="hidden sm:flex items-center gap-2 text-muted-theme hover:text-foreground transition-colors text-[14px] font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>English</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[14px] font-medium text-foreground">
              Already have an account?
            </span>
            <Link 
              href="/login"
              className="px-5 py-2.5 border-2 border-[#1a5b28]/20 hover:border-accent text-accent font-semibold text-[14px] rounded-xl transition-all flex items-center gap-2 bg-white"
            >
              Sign In <span className="font-bold text-lg leading-none">→</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 pt-24">
        {children}
      </main>
    </div>
  );
}
