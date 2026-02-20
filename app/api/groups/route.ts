import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 401 }
      );
    }

    // TODO: Fetch groups from Google Sheets
    // For now, return empty array
    return NextResponse.json({
      groups: [],
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, branches } = body;

    if (!name || !subject) {
      return NextResponse.json(
        { error: 'Name and subject required' },
        { status: 400 }
      );
    }

    // TODO: Create group in Google Sheets
    const groupId = `group-${Date.now()}`;

    return NextResponse.json({
      group: {
        id: groupId,
        name,
        subject,
        branches: branches || [],
        owners: [email],
        leaders: [email],
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
