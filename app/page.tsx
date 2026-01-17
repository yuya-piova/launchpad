'use client';

import React, { useEffect, useState } from 'react';
import {
  format,
  isBefore,
  isSameDay,
  addDays,
  startOfDay,
  parseISO,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, ExternalLink, Bell, Bot } from 'lucide-react';

// State名と色のマッピング
const STATE_COLORS: { [key: string]: string } = {
  INBOX: 'bg-red-500',
  Wrapper: 'bg-blue-500',
  Waiting: 'bg-yellow-500',
  Going: 'bg-purple-500',
  Done: 'bg-green-500',
};

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState('');

  // データ取得関数
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/notion');
      const data = await res.json();
      const allTasks = data.results || [];

      const today = startOfDay(new Date());
      const cols: { [key: string]: any[] } = { Overdue: [] };

      // 今日から6日後までの枠を作成
      for (let i = 0; i < 7; i++) {
        const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
        cols[dateKey] = [];
      }

      allTasks.forEach((task: any) => {
        const dateProp = task.properties?.Date?.date?.start;
        if (!dateProp) return;

        const taskDate = startOfDay(parseISO(dateProp));

        if (isBefore(taskDate, today)) {
          cols['Overdue'].push(task);
        } else {
          const dateKey = format(taskDate, 'yyyy-MM-dd');
          if (cols[dateKey]) {
            cols[dateKey].push(task);
          }
        }
      });

      setColumns(cols);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quick Add 送信処理
  const handleQuickAdd = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      const title = quickTask;
      setQuickTask('');

      try {
        const res = await fetch('/api/notion/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });

        if (res.ok) {
          fetchTasks();
        }
      } catch (err) {
        console.error('Quick Add failed', err);
        setQuickTask(title);
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 font-mono text-xs uppercase tracking-widest">
        Syncing with Notion...
      </div>
    );

  const today = new Date();
  const weekEnd = addDays(today, 6);
  const weekRange = `${format(today, 'MMM d', { locale: enUS })} - ${format(weekEnd, 'MMM d, yyyy', { locale: enUS })}`;
  const todayStr = format(today, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden">
      <div className="px-8 pt-6 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Weekly Focus
        </h2>
        <div className="text-[10px] text-gray-500 font-mono uppercase">
          {weekRange}
        </div>
      </div>

      <main className="flex-1 overflow-x-auto flex p-6 space-x-2 no-scrollbar">
        {Object.entries(columns).map(([dateKey, tasks]) => {
          const isToday = dateKey === todayStr;
          const isOverdue = dateKey === 'Overdue';
          const label = isOverdue
            ? 'OVERDUE'
            : format(parseISO(dateKey), 'dd EEE', {
                locale: enUS,
              }).toUpperCase();

          return (
            <div
              key={dateKey}
              className={`min-w-[270px] max-w-[270px] p-2 flex flex-col rounded-xl transition-all ${
                isToday
                  ? 'bg-blue-500/5 ring-1 ring-inset ring-blue-500/10'
                  : ''
              }`}
            >
              <div
                className={`text-[11px] font-bold mb-4 px-2 flex items-center justify-between ${
                  isToday
                    ? 'text-blue-400'
                    : isOverdue
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                <span>{label}</span>
                {isToday && (
                  <span className="text-[8px] bg-blue-400/20 px-1.5 py-0.5 rounded tracking-tighter">
                    TODAY
                  </span>
                )}
                <span className="text-[9px] opacity-40 font-normal">
                  {tasks.length}
                </span>
              </div>

              {/* タスクリスト（スクロールバー非表示のスタイルを追加） */}
              <div
                className="space-y-2 overflow-y-auto pb-10 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tasks.map((task) => {
                  const stateProp = task.properties?.State;
                  const stateName =
                    stateProp?.status?.name ||
                    stateProp?.select?.name ||
                    'Todo';
                  const dotColor = STATE_COLORS[stateName] || 'bg-gray-600';

                  return (
                    <div
                      key={task.id}
                      className={`task-card group p-3 rounded-lg bg-[#1E1E1E] border border-white/5 relative border-l-2 transition-all hover:border-white/10 ${
                        isOverdue
                          ? 'border-l-red-500'
                          : isToday
                            ? 'border-l-blue-400'
                            : 'border-l-gray-700'
                      }`}
                    >
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 text-gray-500 transition-all"
                      >
                        <ExternalLink size={10} />
                      </a>
                      <div className="flex items-start">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}
                        />
                        <div className="ml-2 pr-4 flex-1">
                          <h4 className="text-[11px] font-medium text-gray-200 leading-snug">
                            {task.properties?.Name?.title?.[0]?.plain_text ||
                              'Untitled'}
                          </h4>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {task.properties?.Cat?.multi_select?.map(
                              (cat: any) => (
                                <span
                                  key={cat.name}
                                  className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400/80 rounded"
                                >
                                  {cat.name}
                                </span>
                              ),
                            )}
                            {task.properties?.SubCat?.multi_select?.map(
                              (scat: any) => (
                                <span
                                  key={scat.name}
                                  className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded border border-white/5"
                                >
                                  {scat.name}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="border border-dashed border-white/5 h-16 rounded-lg flex items-center justify-center group hover:border-white/10 transition-colors cursor-pointer">
                    <Plus
                      size={14}
                      className="text-gray-800 group-hover:text-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
('use client');

import React, { useEffect, useState } from 'react';
import {
  format,
  isBefore,
  isSameDay,
  addDays,
  startOfDay,
  parseISO,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, ExternalLink, Bell, Bot } from 'lucide-react';

// State名と色のマッピング
const STATE_COLORS: { [key: string]: string } = {
  INBOX: 'bg-red-500',
  Wrapper: 'bg-blue-500',
  Waiting: 'bg-yellow-500',
  Going: 'bg-purple-500',
  Done: 'bg-green-500',
};

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState('');

  // データ取得関数
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/notion');
      const data = await res.json();
      const allTasks = data.results || [];

      const today = startOfDay(new Date());
      const cols: { [key: string]: any[] } = { Overdue: [] };

      // 今日から6日後までの枠を作成
      for (let i = 0; i < 7; i++) {
        const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
        cols[dateKey] = [];
      }

      allTasks.forEach((task: any) => {
        const dateProp = task.properties?.Date?.date?.start;
        if (!dateProp) return;

        const taskDate = startOfDay(parseISO(dateProp));

        if (isBefore(taskDate, today)) {
          cols['Overdue'].push(task);
        } else {
          const dateKey = format(taskDate, 'yyyy-MM-dd');
          if (cols[dateKey]) {
            cols[dateKey].push(task);
          }
        }
      });

      setColumns(cols);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quick Add 送信処理
  const handleQuickAdd = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      const title = quickTask;
      setQuickTask('');

      try {
        const res = await fetch('/api/notion/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });

        if (res.ok) {
          fetchTasks();
        }
      } catch (err) {
        console.error('Quick Add failed', err);
        setQuickTask(title);
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 font-mono text-xs uppercase tracking-widest">
        Syncing with Notion...
      </div>
    );

  const today = new Date();
  const weekEnd = addDays(today, 6);
  const weekRange = `${format(today, 'MMM d', { locale: enUS })} - ${format(weekEnd, 'MMM d, yyyy', { locale: enUS })}`;
  const todayStr = format(today, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden">
      {/* メインヘッダー */}
      <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-[#0F0F0F]/80 backdrop-blur-xl shrink-0">
        <div className="w-48"></div>
        <div className="flex-1 max-w-xl">
          <div className="bg-white/5 border border-white/10 flex items-center px-4 py-2 rounded-full focus-within:border-blue-500/50 transition-all">
            <Plus size={16} className="text-gray-500 mr-3" />
            <input
              type="text"
              value={quickTask}
              onChange={(e) => setQuickTask(e.target.value)}
              onKeyDown={handleQuickAdd}
              placeholder="Task, Date, Description..."
              className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder:text-gray-600"
            />
            <kbd className="text-[9px] text-gray-600 ml-2 font-mono">ENTER</kbd>
          </div>
        </div>
        <div className="w-48 flex items-center justify-end space-x-2">
          <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400">
            <Bell size={18} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-2"></div>
          <button className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center hover:bg-white/10 transition">
            <Bot size={14} className="mr-2 text-purple-400" />
            AI議事録
          </button>
        </div>
      </header>

      <div className="px-8 pt-6 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Weekly Focus
        </h2>
        <div className="text-[10px] text-gray-500 font-mono uppercase">
          {weekRange}
        </div>
      </div>

      <main className="flex-1 overflow-x-auto flex p-6 space-x-2 no-scrollbar">
        {Object.entries(columns).map(([dateKey, tasks]) => {
          const isToday = dateKey === todayStr;
          const isOverdue = dateKey === 'Overdue';
          const label = isOverdue
            ? 'OVERDUE'
            : format(parseISO(dateKey), 'dd EEE', {
                locale: enUS,
              }).toUpperCase();

          return (
            <div
              key={dateKey}
              className={`min-w-[270px] max-w-[270px] p-2 flex flex-col rounded-xl transition-all ${
                isToday
                  ? 'bg-blue-500/5 ring-1 ring-inset ring-blue-500/10'
                  : ''
              }`}
            >
              <div
                className={`text-[11px] font-bold mb-4 px-2 flex items-center justify-between ${
                  isToday
                    ? 'text-blue-400'
                    : isOverdue
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                <span>{label}</span>
                {isToday && (
                  <span className="text-[8px] bg-blue-400/20 px-1.5 py-0.5 rounded tracking-tighter">
                    TODAY
                  </span>
                )}
                <span className="text-[9px] opacity-40 font-normal">
                  {tasks.length}
                </span>
              </div>

              {/* タスクリスト（スクロールバー非表示のスタイルを追加） */}
              <div
                className="space-y-2 overflow-y-auto pb-10 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tasks.map((task) => {
                  const stateProp = task.properties?.State;
                  const stateName =
                    stateProp?.status?.name ||
                    stateProp?.select?.name ||
                    'Todo';
                  const dotColor = STATE_COLORS[stateName] || 'bg-gray-600';

                  return (
                    <div
                      key={task.id}
                      className={`task-card group p-3 rounded-lg bg-[#1E1E1E] border border-white/5 relative border-l-2 transition-all hover:border-white/10 ${
                        isOverdue
                          ? 'border-l-red-500'
                          : isToday
                            ? 'border-l-blue-400'
                            : 'border-l-gray-700'
                      }`}
                    >
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 text-gray-500 transition-all"
                      >
                        <ExternalLink size={10} />
                      </a>
                      <div className="flex items-start">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`}
                        />
                        <div className="ml-2 pr-4 flex-1">
                          <h4 className="text-[11px] font-medium text-gray-200 leading-snug">
                            {task.properties?.Name?.title?.[0]?.plain_text ||
                              'Untitled'}
                          </h4>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {task.properties?.Cat?.multi_select?.map(
                              (cat: any) => (
                                <span
                                  key={cat.name}
                                  className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400/80 rounded"
                                >
                                  {cat.name}
                                </span>
                              ),
                            )}
                            {task.properties?.SubCat?.multi_select?.map(
                              (scat: any) => (
                                <span
                                  key={scat.name}
                                  className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded border border-white/5"
                                >
                                  {scat.name}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="border border-dashed border-white/5 h-16 rounded-lg flex items-center justify-center group hover:border-white/10 transition-colors cursor-pointer">
                    <Plus
                      size={14}
                      className="text-gray-800 group-hover:text-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
