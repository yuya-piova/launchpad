'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Rocket,
  Plus,
  Bell, // 追加
  Bot, // 追加
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthProvider';
import LoginScreen from './LoginScreen';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginScreen />;
  return <>{children}</>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [quickTask, setQuickTask] = useState(''); // 追加

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Add 送信ロジックの実装
  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      const title = quickTask;
      setQuickTask(''); // 入力欄をクリア

      try {
        const res = await fetch('/api/notion/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });

        if (res.ok) {
          // ページをリロードしてNotionの最新データを反映
          window.location.reload();
        }
      } catch (err) {
        console.error('Quick Add failed', err);
        setQuickTask(title); // 失敗したら入力を戻す
      }
    }
  };

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex h-screen w-screen overflow-hidden bg-[#0F0F0F] text-[#E5E5E5]">
          {/* サイドバー */}
          <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${
              isHovered ? 'w-60' : 'w-16'
            } transition-all duration-300 ease-in-out border-r border-white/5 bg-[#1A1A1A] flex flex-col z-50`}
          >
            <div className="h-[72px] flex items-center px-4 mb-4 overflow-hidden shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded flex-shrink-0 flex items-center justify-center">
                <Rocket size={18} className="text-white" />
              </div>
              <span
                className={`ml-4 font-bold text-lg whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                LaunchPad
              </span>
            </div>

            <nav className="flex-1 px-3 space-y-2">
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
          </aside>

          {/* メインエリア */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-[72px] border-b border-white/5 flex items-center px-8 bg-[#0F0F0F]/80 backdrop-blur-xl shrink-0">
              {/* 左側：時計と日付 */}
              <div className="flex items-center space-x-4 w-48 shrink-0">
                {mounted ? (
                  <>
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
                  </>
                ) : (
                  <div className="h-10 w-32 bg-white/5 animate-pulse rounded" />
                )}
              </div>

              {/* 中央：Quick Add */}
              <div className="flex-1 max-w-xl mx-auto">
                <div className="bg-white/5 border border-white/10 flex items-center px-4 py-2 rounded-full focus-within:border-blue-500/50 transition-all">
                  <Plus size={16} className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    value={quickTask}
                    onChange={(e) => setQuickTask(e.target.value)}
                    onKeyDown={handleQuickAdd}
                    placeholder="Quick Add Task..."
                    className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder:text-gray-600"
                  />
                  <kbd className="text-[9px] text-gray-600 ml-2 font-mono">
                    ENTER
                  </kbd>
                </div>
              </div>

              {/* 右側：Quick Links */}
              <div className="w-48 flex items-center justify-end space-x-3 shrink-0">
                <button className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
                  <Bell size={18} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <button className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center hover:bg-white/10 transition-all group">
                  <Bot
                    size={14}
                    className="mr-2 text-purple-400 group-hover:scale-110 transition-transform"
                  />
                  AI議事録
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}

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
