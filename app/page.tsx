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
import { enUS } from 'date-fns/locale'; // 英語表記用
import { Plus, ExternalLink, Bell, Bot } from 'lucide-react';

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [quickTask, setQuickTask] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/notion');
        const data = await res.json();
        setColumns(groupTasksByDate(data.results || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  // 日付グループ化ロジック
  const groupTasksByDate = (allTasks: any[]) => {
    const today = startOfDay(new Date());
    const cols: { [key: string]: any[] } = { Overdue: [] };
    for (let i = 0; i < 7; i++) {
      cols[format(addDays(today, i), 'yyyy-MM-dd')] = [];
    }
    allTasks.forEach((task) => {
      const dateProp = task.properties?.Date?.date?.start;
      if (!dateProp) return;
      const taskDate = startOfDay(parseISO(dateProp));
      if (isBefore(taskDate, today)) cols['Overdue'].push(task);
      else {
        const key = format(taskDate, 'yyyy-MM-dd');
        if (cols[key]) cols[key].push(task);
      }
    });
    return cols;
  };

  // Quick Add 送信処理
  const handleQuickAdd = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTask.trim()) {
      const currentTask = quickTask;
      setQuickTask(''); // 入力欄を先にクリア（woche風の軽快な操作感）

      try {
        const res = await fetch('/api/notion/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: currentTask }),
        });

        if (res.ok) {
          // 登録成功したらデータを再取得して画面を更新
          // fetchTasksを関数として切り出しておくと便利です
          window.location.reload();
        }
      } catch (err) {
        console.error('Quick Add failed', err);
        setQuickTask(currentTask); // 失敗したら入力を戻す
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Syncing...</div>;

  const today = new Date();
  const weekEnd = addDays(today, 6);
  // Jan 12 - Jan 18, 2026 形式
  const weekRange = `${format(today, 'MMM d', { locale: enUS })} - ${format(weekEnd, 'MMM d, yyyy', { locale: enUS })}`;

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-hidden">
      {/* メインヘッダー（Quick Add & Quick Link） */}
      <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-[#0F0F0F]/80 backdrop-blur-xl shrink-0">
        {/* 左側：時計（ClientLayoutにある場合は空けておくか、ここに入れる） */}
        <div className="w-48"></div>

        {/* 中央：Quick Add */}
        <div className="flex-1 max-w-xl">
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
            <kbd className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded ml-2 font-mono">
              ENTER
            </kbd>
          </div>
        </div>

        {/* 右側：Quick Links */}
        <div className="w-48 flex items-center justify-end space-x-3">
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

      {/* サブヘッダー */}
      <div className="px-8 pt-6 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Weekly Focus
        </h2>
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-tight">
          {weekRange}
        </div>
      </div>

      {/* ボードエリア */}
      <main className="flex-1 overflow-x-auto flex p-6 space-x-2 no-scrollbar">
        {Object.entries(columns).map(([dateKey, tasks]) => {
          const isToday = dateKey === format(today, 'yyyy-MM-dd');
          const isOverdue = dateKey === 'Overdue';
          const label = isOverdue
            ? 'OVERDUE'
            : format(parseISO(dateKey), 'dd EEE', {
                locale: enUS,
              }).toUpperCase();

          return (
            <div
              key={dateKey}
              className={`min-w-[270px] max-w-[270px] p-2 flex flex-col rounded-xl ${isToday ? 'bg-blue-500/5' : ''}`}
            >
              <div
                className={`text-[11px] font-bold mb-4 px-2 flex items-center justify-between ${isToday ? 'text-blue-400' : isOverdue ? 'text-red-500' : 'text-gray-500'}`}
              >
                <span>{label}</span>
                {isToday && (
                  <span className="text-[8px] bg-blue-400/20 px-1.5 py-0.5 rounded">
                    TODAY
                  </span>
                )}
              </div>

              {/* タスクリスト（縦スクロールバーを非表示化） */}
              <div className="space-y-2 overflow-y-auto pb-10 no-scrollbar">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card group p-3 rounded-lg bg-[#1E1E1E] border border-white/5 relative border-l-2 transition-all hover:border-white/10"
                    style={{
                      borderLeftColor: isOverdue
                        ? '#ef4444'
                        : isToday
                          ? '#60a5fa'
                          : '#374151',
                    }}
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
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          task.properties?.State?.status?.name === 'Doing'
                            ? 'bg-blue-500'
                            : 'bg-gray-600'
                        }`}
                      />
                      <div className="ml-2 pr-4">
                        <h4 className="text-[11px] font-medium text-gray-200 leading-snug">
                          {task.properties?.Name?.title?.[0]?.plain_text ||
                            'Untitled'}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {task.properties?.Cat?.multi_select?.map((c: any) => (
                            <span
                              key={c.name}
                              className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400/80 rounded"
                            >
                              {c.name}
                            </span>
                          ))}
                          {task.properties?.SubCat?.multi_select?.map(
                            (s: any) => (
                              <span
                                key={s.name}
                                className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded border border-white/5"
                              >
                                {s.name}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="border border-dashed border-white/5 h-16 rounded-lg flex items-center justify-center text-gray-800">
                    <Plus size={14} />
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
