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

    // フィルタ条件をANDで結合
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            // 条件1: CatにWorkが含まれる
            property: 'Cat',
            multi_select: {
              contains: 'Work',
            },
          },
          {
            // 条件2: State（またはStatus）がDoneでない
            property: 'State',
            status: {
              does_not_equal: 'Done',
            },
          },
          {
            // 条件3: State（またはStatus）がCanceledでない
            property: 'State',
            status: {
              does_not_equal: 'Canceled',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'ascending',
        },
      ],
      page_size: 100,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Notion API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
