import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({
      database_id: databaseId!,
      filter: {
        and: [
          { property: 'Cat', multi_select: { contains: 'Work' } },
          { property: 'SubCat', multi_select: { contains: 'Meeting' } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
