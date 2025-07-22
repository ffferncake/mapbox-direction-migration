// standardize the start of a day.
export function setToMidnight(date: Date): Date {
  return new Date(date.setHours(0, 0, 0, 0));
}
