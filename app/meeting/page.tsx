'use client';

import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ExternalLink } from 'lucide-react';

export default function MeetingPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch('/api/notion/meeting-list');
        const data = await res.json();
        setMeetings(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-gray-500 font-mono text-xs uppercase tracking-widest">
        Loading Meeting Logs...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] text-gray-300">
      <div className="px-8 pt-6 pb-4">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          Meeting Archive
        </h2>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-10 no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-600 uppercase tracking-wider">
              <th className="py-3 font-medium w-1/3">Name</th>
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">State</th>
              <th className="py-3 font-medium">Keywords</th>
              <th className="py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {meetings.map((m) => {
              const name =
                m.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
              const date = m.properties?.Date?.date?.start || '';
              const state =
                m.properties?.State?.status?.name ||
                m.properties?.State?.select?.name ||
                '-';
              const keywords = m.properties?.FreeKeyWord?.multi_select || [];

              return (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 font-medium text-gray-200">{name}</td>
                  <td className="py-4 text-gray-500 font-mono">
                    {date ? format(parseISO(date), 'yyyy.MM.dd') : '-'}
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px]">
                      {state}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((k: any) => (
                        <span key={k.name} className="text-[9px] text-blue-400">
                          #{k.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block p-2 hover:bg-white/5 rounded-md transition-colors text-gray-600 hover:text-white"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
