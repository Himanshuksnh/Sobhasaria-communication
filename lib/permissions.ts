// Permission helper functions

export const isTeacher = (userEmail: string | null | undefined, group?: any): boolean => {
  if (!userEmail) return false;
  
  const masterTeacherEmail = process.env.NEXT_PUBLIC_MASTER_TEACHER_EMAIL?.toLowerCase();
  const isMasterTeacher = userEmail.toLowerCase() === masterTeacherEmail;
  
  // Check if user is group-specific teacher
  const isGroupTeacher = group?.teacherEmails?.some(
    (email: string) => email.toLowerCase() === userEmail.toLowerCase()
  );
  
  return isMasterTeacher || isGroupTeacher;
};

export const isMasterTeacher = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  const masterTeacherEmail = process.env.NEXT_PUBLIC_MASTER_TEACHER_EMAIL?.toLowerCase();
  return userEmail.toLowerCase() === masterTeacherEmail;
};
