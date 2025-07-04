import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { EnhancedHeader } from "./Header";

export const Layout = () => {
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar - Only visible on desktop, mobile uses overlay */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Only visible on desktop, mobile has integrated header in sidebar */}
        <div className="hidden lg:block">
          <EnhancedHeader />
        </div>

        {/* Main Content with proper mobile spacing */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile: Add top padding for fixed header */}
          {/* Desktop: No extra padding needed */}
          <div className="pt-16 lg:pt-0 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
