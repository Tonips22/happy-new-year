function addToCalendar(event: { title: string; description?: string; location?: string; startDate: Date; endDate?: Date }) {
  const { title, description, location, startDate, endDate } = event;

  const formatDate = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d{3}/g, '');

  const start = formatDate(startDate);
  const end = endDate
    ? formatDate(endDate)
    : formatDate(new Date(startDate.getTime() + 60 * 60 * 1000));

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@happy-new-year`;
  const stamp = formatDate(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Happy New Year//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${stamp}`,
    `UID:${uid}`,
    `SUMMARY:${title}`,
  ];

  if (description) lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);
  if (location) lines.push(`LOCATION:${location}`);

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default addToCalendar;