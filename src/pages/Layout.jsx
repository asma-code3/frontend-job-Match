import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_25%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow ring-1 ring-slate-200"
      >
        Menu
      </button>

      <main className="lg:ml-72 min-h-screen p-4 pt-20 lg:p-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
