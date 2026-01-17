'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  GraduationCap,
  Rocket,
  Plus,
} from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(new Date());

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* サイドバー */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${
          isHovered ? 'w-60' : 'w-16'
        } transition-all duration-300 ease-in-out border-r border-white/5 bg-[#1A1A1A] flex flex-col z-50`}
      >
        <div className="h-[72px] flex items-center px-4 mb-4 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded flex-shrink-0 flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <span
            className={`ml-4 font-bold text-lg whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          >
            LaunchPad
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-hidden">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active
            isOpen={isHovered}
          />
          <NavItem
            icon={<Calendar size={20} />}
            label="Monthly"
            isOpen={isHovered}
          />
          <NavItem
            icon={<MessageSquare size={20} />}
            label="Meeting"
            isOpen={isHovered}
          />
        </nav>

        {/* 駿台Diverseリンク */}
        <div className="p-3 border-t border-white/5 overflow-hidden">
          <a
            href="https://lms2.s-diverse.com"
            target="_blank"
            className="flex items-center px-2 py-2.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-orange-400 transition-colors"
          >
            <GraduationCap size={20} className="flex-shrink-0" />
            <span
              className={`ml-4 text-xs font-semibold whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              駿台Diverse LMS
            </span>
          </a>
        </div>
      </aside>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 固定ヘッダー */}
        <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-[#0F0F0F]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-light tabular-nums tracking-tighter">
              {time.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-xs text-gray-500 leading-tight">
              {time.toLocaleDateString('ja-JP', {
                month: '2-digit',
                day: '2-digit',
              })}
              <br />
              {time
                .toLocaleDateString('en-US', { weekday: 'short' })
                .toUpperCase()}
            </div>
          </div>
          <div className="flex-1 max-w-xl mx-12">
            <div className="bg-white/5 border border-white/10 flex items-center px-4 py-2 rounded-full focus-within:border-blue-500/50 transition-all">
              <Plus size={16} className="text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Task, Date, Description..."
                className="bg-transparent border-none outline-none w-full text-sm"
              />
            </div>
          </div>
          <div className="w-32 hidden md:block" /> {/* バランス調整用 */}
        </header>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}

// サブコンポーネント
function NavItem({
  icon,
  label,
  active = false,
  isOpen,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
}) {
  return (
    <div
      className={`flex items-center px-2 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span
        className={`ml-4 font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        {label}
      </span>
    </div>
  );
}
