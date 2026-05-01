import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pt-4 animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  );
}