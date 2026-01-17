import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { error: 'DATABASE_ID is missing' },
        { status: 500 },
      );
    }

    // Notion側でフィルタリングとソートを行う
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        // 'Cat' プロパティに 'Work' が含まれるものだけを取得
        property: 'Cat',
        multi_select: {
          contains: 'Work',
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'ascending', // 日付が古い順（Overdueが先に来るように）
        },
      ],
      page_size: 100, // 余裕を持って100件取得
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
