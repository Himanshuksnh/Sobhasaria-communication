import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const groupId = request.nextUrl.searchParams.get('groupId');
    const date = request.nextUrl.searchParams.get('date');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID required' },
        { status: 400 }
      );
    }

    // TODO: Fetch attendance from Google Sheets
    return NextResponse.json({
      attendance: [],
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, date, records } = body;

    if (!groupId || !date || !records) {
      return NextResponse.json(
        { error: 'groupId, date, and records required' },
        { status: 400 }
      );
    }

    // TODO: Save attendance to Google Sheets
    return NextResponse.json({
      success: true,
      message: 'Attendance saved',
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}
