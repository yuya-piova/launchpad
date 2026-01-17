'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, Tag } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/notion-test');
        const data = await res.json();
        setTasks(data.results || []);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* ヒーローセクション */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-4">
          Focus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-2">Welcome back.</h3>
            <p className="text-gray-400 text-sm">
              You have {tasks.length} active tasks today.
            </p>
          </div>
        </div>
      </section>

      {/* タスクセクション（woche風カード） */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-4">
          Tasks
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-white/5 animate-pulse rounded-2xl border border-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task: any) => {
              const title =
                task.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
              const status =
                task.properties?.Status?.select?.name || 'No Status';
              const date = task.properties?.Date?.date?.start || '';

              return (
                <div
                  key={task.id}
                  className="group relative p-5 bg-[#1A1A1A]/50 border border-white/5 rounded-2xl hover:bg-[#1A1A1A] hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase ${
                            status === 'Done'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {status}
                        </span>
                        {date && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {date}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-gray-200 group-hover:text-white leading-snug">
                        {title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 border border-[#1A1A1A] flex items-center justify-center text-[8px]">
                          YP
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded-full">
                        <CheckCircle2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
