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
import { Plus, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [columns, setColumns] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/notion');
        const data = await res.json();
        const allTasks = data.results || [];

        const today = startOfDay(new Date());
        const cols: { [key: string]: any[] } = { Overdue: [] };

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
    }
    fetchTasks();
  }, []);

  // Stateに応じたドットの色を決定する関数
  const getStateColor = (state: string) => {
    switch (state) {
      case 'Doing':
        return 'bg-blue-500';
      case 'Todo':
        return 'bg-gray-500';
      case 'Review':
        return 'bg-purple-500';
      default:
        return 'bg-gray-700';
    }
  };

  if (loading)
    return <div className="p-8 text-gray-500">Syncing LaunchPad...</div>;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      <div className="px-8 pt-6 pb-2 flex items-baseline justify-between shrink-0">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
          Weekly Focus
        </h2>
        <div className="text-[11px] text-gray-500 font-mono">
          {format(new Date(), 'MM/dd')} -{' '}
          {format(addDays(new Date(), 6), 'MM/dd')}
        </div>
      </div>

      <main className="flex-1 overflow-x-auto flex p-6 space-x-2 no-scrollbar">
        {Object.entries(columns).map(([dateKey, tasks]) => {
          const isToday = dateKey === todayStr;
          const isOverdue = dateKey === 'Overdue';
          let label = isOverdue
            ? 'OVERDUE'
            : format(parseISO(dateKey), 'dd EEE', { locale: ja }).toUpperCase();

          return (
            <div
              key={dateKey}
              className={`min-w-[280px] max-w-[280px] p-2 flex flex-col rounded-xl ${isToday ? 'bg-blue-500/5' : ''}`}
            >
              <div
                className={`text-[11px] font-bold mb-4 px-2 flex items-center justify-between ${isToday ? 'text-blue-400' : isOverdue ? 'text-red-500' : 'text-gray-500'}`}
              >
                <span>{label}</span>
                {isToday && (
                  <span className="text-[9px] bg-blue-400/20 px-1.5 py-0.5 rounded">
                    TODAY
                  </span>
                )}
              </div>

              <div className="space-y-2 overflow-y-auto no-scrollbar pb-10">
                {tasks.map((task) => {
                  const stateName =
                    task.properties?.State?.status?.name ||
                    task.properties?.State?.select?.name ||
                    'Todo';
                  const cats = task.properties?.Cat?.multi_select || [];
                  const subCats = task.properties?.SubCat?.multi_select || [];

                  return (
                    <div
                      key={task.id}
                      className="task-card group p-3 rounded-lg bg-[#1E1E1E] border border-white/5 relative"
                    >
                      {/* Notionリンクボタン */}
                      <a
                        href={task.public_url || task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/0 hover:bg-white/5 text-gray-600 hover:text-gray-300 transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>

                      <div className="flex items-start pr-6">
                        {/* ステータスドット */}
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${getStateColor(stateName)}`}
                        />

                        <div className="ml-2 flex-1">
                          <h4 className="text-[11px] font-medium text-gray-200 leading-snug">
                            {task.properties?.Name?.title?.[0]?.plain_text ||
                              'Untitled'}
                          </h4>

                          {/* 下部バッジエリア */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {cats.map((cat: any) => (
                              <span
                                key={cat.name}
                                className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400/80 rounded"
                              >
                                {cat.name}
                              </span>
                            ))}
                            {subCats.map((scat: any) => (
                              <span
                                key={scat.name}
                                className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded border border-white/5"
                              >
                                {scat.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
