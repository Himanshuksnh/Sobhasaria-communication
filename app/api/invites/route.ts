import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID required' },
        { status: 400 }
      );
    }

    // Generate unique invite code
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    // TODO: Save invite to Google Sheets
    return NextResponse.json({
      invite: {
        groupId,
        code,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
      inviteLink: `/join/${code}`,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code required' },
        { status: 400 }
      );
    }

    // TODO: Verify invite code from Google Sheets
    return NextResponse.json({
      valid: false,
      message: 'Invite not found or expired',
    });
  } catch (error) {
    console.error('Error verifying invite:', error);
    return NextResponse.json(
      { error: 'Failed to verify invite' },
      { status: 500 }
    );
  }
}
