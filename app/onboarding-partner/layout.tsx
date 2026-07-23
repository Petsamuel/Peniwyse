import { ReactNode } from "react";
import { OnboardingProvider } from "./context/OnboardingContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="h-screen bg-slate-50 flex font-montserrat overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[300px] bg-slate-50 border-r border-slate-200 hidden md:block">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 bg-white p-6 md:p-12 overflow-y-auto">
            <div className="max-w-3xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
