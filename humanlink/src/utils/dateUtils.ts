const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Manila',
});

const displayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Manila',
});

export const getToday = (): string => isoFormatter.format(new Date());

export const formatISODate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? '' : isoFormatter.format(d);
};

export const formatDisplayDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid Date';

  return displayFormatter.format(d).replace(' at ', ' ');
};