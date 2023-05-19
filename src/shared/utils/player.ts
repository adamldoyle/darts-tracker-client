export const displayName = (email: string): string => {
  return email.split('@')[0].split('.')[0];
};
