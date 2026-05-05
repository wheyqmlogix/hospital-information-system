import { formatInTimeZone } from "date-fns-tz";

const TIME_ZONE = "Asia/Manila";

/**
 * Returns the current date/time. 
 * Note: Prisma stores DateTime as UTC in the database.
 */
export function getNow() {
  return new Date();
}

/**
 * Formats a date to Philippine Standard Time (PST).
 */
export function formatPST(date: Date | number, formatStr: string = "yyyy-MM-dd HH:mm:ss") {
  return formatInTimeZone(date, TIME_ZONE, formatStr);
}

/**
 * Returns a ISO string representation in PST.
 */
export function toPSTString(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
}
