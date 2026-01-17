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
import { ja } from 'date-fns/locale';
import { Plus, Rocket } from 'lucide-react';

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/notion-test');
        const data = await res.json();
        const allTasks = data.results || [];

        // 1. Cat = Work フィルタリング
        const workTasks = allTasks.filter((task: any) => {
          const cats = task.properties?.Cat?.multi_select || [];
          return cats.some((cat: any) => cat.name === 'Work');
        });

        const today = startOfDay(new Date());
        const cols: { [key: string]: any[] } = { Overdue: [] };

        // 今日から6日後までの計7日分の枠を作成
        for (let i = 0; i < 7; i++) {
          const dateKey = format(addDays(today, i), 'yyyy-MM-dd');
          cols[dateKey] = [];
        }

        workTasks.forEach((task: any) => {
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
    }
    fetchTasks();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        Syncing with Notion...
      </div>
    );

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* サブヘッダー */}
      <div className="px-8 pt-6 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Weekly Focus
        </h2>
        <div className="text-[10px] text-gray-600 font-mono uppercase">
          {format(new Date(), 'MMM dd', { locale: ja })} -{' '}
          {format(addDays(new Date(), 6), 'MMM dd, yyyy', { locale: ja })}
        </div>
      </div>

      {/* ボードエリア */}
      <main className="flex-1 overflow-x-auto flex p-6 space-x-2 no-scrollbar">
        {Object.entries(columns).map(([dateKey, tasks]) => {
          const isToday = dateKey === todayStr;
          const isOverdue = dateKey === 'Overdue';

          // 表示用のラベル作成
          let label = '';
          if (isOverdue) label = 'OVERDUE';
          else {
            const dateObj = parseISO(dateKey);
            label = format(dateObj, 'dd EEE', { locale: ja }).toUpperCase();
          }

          return (
            <div
              key={dateKey}
              className={`min-w-[260px] max-w-[260px] p-2 flex flex-col rounded-xl transition-colors ${
                isToday
                  ? 'bg-blue-500/5 ring-1 ring-inset ring-blue-500/10'
                  : 'bg-transparent'
              }`}
            >
              {/* カラムタイトル */}
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

              {/* タスクカード群 */}
              <div className="space-y-2 overflow-y-auto no-scrollbar pb-10">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg bg-[#1E1E1E] border border-white/5 shadow-sm hover:border-white/10 transition-all group border-l-2 ${
                      isOverdue
                        ? 'border-l-red-500'
                        : isToday
                          ? 'border-l-blue-400'
                          : 'border-l-gray-700'
                    }`}
                  >
                    <h4 className="text-[11px] font-semibold text-gray-200 leading-tight group-hover:text-white">
                      {task.properties?.Name?.title?.[0]?.plain_text ||
                        'Untitled'}
                    </h4>
                    {/* カテゴリバッジ */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.properties?.Cat?.multi_select?.map((cat: any) => (
                        <span
                          key={cat.name}
                          className="text-[8px] px-1 bg-white/5 text-gray-500 rounded"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 空の状態のプレースホルダー */}
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
