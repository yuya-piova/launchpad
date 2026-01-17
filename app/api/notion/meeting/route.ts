import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const response = await notion.pages.create({
      parent: { database_id: databaseId! },
      properties: {
        Name: {
          title: [{ text: { content: `${today} ミーティング記録 (${time})` } }],
        },
        Cat: {
          multi_select: [{ name: 'Work' }],
        },
        SubCat: {
          multi_select: [{ name: 'Meeting' }],
        },
        State: {
          status: { name: 'Going' }, // すぐ書き始めるのでGoingに設定
        },
        Date: {
          date: { start: today },
        },
      },
      // Body（ページの中身）にAI議事録ブロックを追加
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              { type: 'text', text: { content: '🎙 AI議事録セクション' } },
            ],
          },
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'ここに音声認識やAIの要約を貼り付けてください。',
                },
              },
            ],
            icon: { emoji: '🤖' },
            color: 'blue_background',
          },
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: '決定事項' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: '' } }],
          },
        },
      ],
    });

    return NextResponse.json({ url: response.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
