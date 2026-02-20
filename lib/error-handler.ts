export class LabManagerError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LabManagerError';
  }
}

export enum ErrorCode {
  // Auth errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Group errors
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  GROUP_CREATION_FAILED = 'GROUP_CREATION_FAILED',
  DUPLICATE_GROUP = 'DUPLICATE_GROUP',

  // Sheets errors
  SHEETS_API_ERROR = 'SHEETS_API_ERROR',
  SHEET_NOT_FOUND = 'SHEET_NOT_FOUND',
  SYNC_FAILED = 'SYNC_FAILED',

  // Invite errors
  INVALID_INVITE = 'INVALID_INVITE',
  INVITE_EXPIRED = 'INVITE_EXPIRED',

  // Data errors
  INVALID_ATTENDANCE_DATA = 'INVALID_ATTENDANCE_DATA',
  DATA_SAVE_FAILED = 'DATA_SAVE_FAILED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.UNAUTHORIZED]: 'You do not have permission to perform this action',

  [ErrorCode.GROUP_NOT_FOUND]: 'Group not found',
  [ErrorCode.GROUP_CREATION_FAILED]: 'Failed to create group. Please try again.',
  [ErrorCode.DUPLICATE_GROUP]: 'A group with this name already exists',

  [ErrorCode.SHEETS_API_ERROR]: 'Error communicating with Google Sheets. Please try again.',
  [ErrorCode.SHEET_NOT_FOUND]: 'Group sheet not found in spreadsheet',
  [ErrorCode.SYNC_FAILED]: 'Failed to sync with Google Sheets. Please check your connection.',

  [ErrorCode.INVALID_INVITE]: 'Invalid invite link',
  [ErrorCode.INVITE_EXPIRED]: 'This invite link has expired',

  [ErrorCode.INVALID_ATTENDANCE_DATA]: 'Invalid attendance data',
  [ErrorCode.DATA_SAVE_FAILED]: 'Failed to save attendance data. Please try again.',

  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',

  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof LabManagerError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

export function logError(error: unknown, context?: string) {
  if (typeof window !== 'undefined') {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${context || 'Error'}:`, error);
  }
}

export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  errorCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): Promise<[T | null, LabManagerError | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const labError = error instanceof LabManagerError
      ? error
      : new LabManagerError(errorCode, getErrorMessage(error), error);

    logError(labError);
    return [null, labError];
  }
}
