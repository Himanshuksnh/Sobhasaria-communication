import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const groupId = request.nextUrl.searchParams.get('groupId');
    const spreadsheetId = request.nextUrl.searchParams.get('spreadsheetId');

    if (!groupId || !spreadsheetId) {
      return NextResponse.json(
        { error: 'groupId and spreadsheetId required' },
        { status: 400 }
      );
    }

    // TODO: Fetch data from Google Sheets
    // This would use the @googleapis/sheets library to read data
    const data = [
      {
        date: new Date().toISOString().split('T')[0],
        studentId: '001',
        studentName: 'John Doe',
        status: 'present' as const,
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching sync data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, spreadsheetId, data } = body;

    if (!groupId || !spreadsheetId || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Write data to Google Sheets
    // This would use the @googleapis/sheets library to write/update data
    console.log(`Syncing ${data.length} records for group ${groupId}`);

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      recordsCount: data.length,
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: 'Failed to sync data with Google Sheets' },
      { status: 500 }
    );
  }
}
