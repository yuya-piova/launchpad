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
            {/* ヘッダー：文字サイズを微調整 */}
            <tr className="border-b border-white/5 text-[11px] text-gray-600 uppercase tracking-wider">
              <th className="py-2 font-medium w-[20%]">Name</th>
              <th className="py-2 font-medium w-[10%]">Date</th>
              <th className="py-2 font-medium w-[8%]">State</th>
              {/* 要約カラムを追加 */}
              <th className="py-2 font-medium w-[40%]">Summary</th>
              <th className="py-2 font-medium w-[15%]">Keywords</th>
              <th className="py-2 font-medium w-[7%] text-right">Action</th>
            </tr>
          </thead>
          {/* ボディ：文字サイズを大きく(text-sm)、行間を詰める(py-2.5) */}
          <tbody className="text-sm">
            {meetings.map((m) => {
              const name =
                m.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
              const date = m.properties?.Date?.date?.start || '';
              const state =
                m.properties?.State?.status?.name ||
                m.properties?.State?.select?.name ||
                '-';
              const keywords = m.properties?.FreeKeyWord?.multi_select || [];

              // 「要約」プロパティの取得（リッチテキスト型を想定）
              // ※Notion側のプロパティ名が日本語の「要約」である前提です
              const summary =
                m.properties?.['要約']?.rich_text?.[0]?.plain_text || '';

              return (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* 行の高さを抑えるため py-4 -> py-2.5 に変更 */}
                  <td className="py-2.5 font-medium text-gray-200">{name}</td>

                  <td className="py-2.5 text-gray-500 font-mono text-xs">
                    {date ? format(parseISO(date), 'yyyy.MM.dd') : '-'}
                  </td>

                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/5">
                      {state}
                    </span>
                  </td>

                  {/* 要約の表示：長い場合は省略 (...) */}
                  <td className="py-2.5 text-gray-400 text-xs pr-4 max-w-xs truncate">
                    {summary}
                  </td>

                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((k: any) => (
                        <span
                          key={k.name}
                          className="text-[10px] text-blue-400 opacity-80"
                        >
                          #{k.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-2.5 text-right">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-6 h-6 hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-white"
                    >
                      <ExternalLink size={13} />
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
