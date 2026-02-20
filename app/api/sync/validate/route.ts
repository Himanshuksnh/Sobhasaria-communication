import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId } = body;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId required' },
        { status: 400 }
      );
    }

    // TODO: Validate Google Sheets connection
    // This would attempt to access the spreadsheet to verify credentials work
    const isValid = true; // Placeholder

    return NextResponse.json({
      valid: isValid,
      spreadsheetId,
      message: isValid ? 'Connection verified' : 'Connection failed',
    });
  } catch (error) {
    console.error('Error validating connection:', error);
    return NextResponse.json(
      { error: 'Failed to validate connection' },
      { status: 500 }
    );
  }
}
