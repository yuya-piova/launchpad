'use client';

import React, { useEffect, useState } from 'react';
import { format, isBefore, isSameDay, addDays, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/notion-test');
        const data = await res.json();
        const allTasks = data.results || [];

        // 1. Cat = Work でフィルタリング
        const workTasks = allTasks.filter((task: any) => {
          const cats = task.properties?.Cat?.multi_select || [];
          return cats.some((cat: any) => cat.name === 'Work');
        });

        // 2. 日付ごとに分類するロジック
        const today = startOfDay(new Date());
        const cols: { [key: string]: any[] } = {
          Overdue: [],
          Today: [],
        };

        // 今日から6日後までの枠を作る
        for (let i = 1; i <= 6; i++) {
          const dateStr = format(addDays(today, i), 'yyyy-MM-dd');
          cols[dateStr] = [];
        }

        workTasks.forEach((task: any) => {
          const dateProp = task.properties?.Date?.date?.start;
          if (!dateProp) return;

          const taskDate = startOfDay(new Date(dateProp));

          if (isBefore(taskDate, today)) {
            cols['Overdue'].push(task);
          } else if (isSameDay(taskDate, today)) {
            cols['Today'].push(task);
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
    return <div className="p-8 text-gray-500">Loading woche board...</div>;

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div
        className="flex h-full gap-4 pb-4"
        style={{ minWidth: 'max-content' }}
      >
        {Object.keys(columns).map((key) => (
          <div key={key} className="w-72 flex flex-col shrink-0">
            {/* カラムヘッダー */}
            <div className="mb-4 px-2">
              <h3
                className={`text-xs font-bold tracking-widest uppercase ${key === 'Overdue' ? 'text-red-500' : 'text-gray-400'}`}
              >
                {key === 'Today'
                  ? 'TODAY'
                  : key === 'Overdue'
                    ? 'OVERDUE'
                    : format(new Date(key), 'EEE d MMM', {
                        locale: ja,
                      }).toUpperCase()}
              </h3>
              <div className="text-[10px] text-gray-600">
                {columns[key].length} TASKS
              </div>
            </div>

            {/* タスクリスト（スクロールエリア） */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {columns[key].map((task: any) => (
                <div
                  key={task.id}
                  className="p-3 bg-[#1A1A1A] border border-white/5 rounded-lg hover:border-white/20 transition-all group cursor-pointer"
                >
                  <div className="text-xs text-gray-300 leading-relaxed mb-2">
                    {task.properties?.Name?.title?.[0]?.plain_text ||
                      'Untitled'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.properties?.Cat?.multi_select.map((cat: any) => (
                      <span
                        key={cat.id}
                        className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {columns[key].length === 0 && (
                <div className="h-20 border border-dashed border-white/5 rounded-lg flex items-center justify-center text-[10px] text-gray-700">
                  NO TASKS
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
