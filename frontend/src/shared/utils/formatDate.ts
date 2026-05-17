// src/shared/utils/formatDate.ts
export const formatDate = (isoString: string | undefined): string => {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return isoString;
  }
};