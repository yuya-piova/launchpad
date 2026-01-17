import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId || !title) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 今日の日付を取得 (ISO 8601形式: YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        // タイトル
        Name: {
          title: [{ text: { content: title } }],
        },
        // カテゴリ: Work (マルチセレクト)
        Cat: {
          multi_select: [{ name: 'Work' }],
        },
        SubCat: {
          multi_select: [{ name: 'Task' }],
        },
        // ステータス: INBOX
        State: {
          status: { name: 'INBOX' },
        },
        // 日付: 今日
        Date: {
          date: { start: today },
        },
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Notion Create Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
