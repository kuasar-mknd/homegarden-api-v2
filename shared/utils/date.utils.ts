/**
 * Date Utility Functions
 */

/**
 * Calculates the difference in days between two dates.
 * @param dateLeft The later date
 * @param dateRight The earlier date
 * @returns The number of days between the two dates
 */
export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const diffTime = dateLeft.getTime() - dateRight.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Checks if two dates are on the same day.
 * @param dateLeft The first date
 * @param dateRight The second date
 * @returns True if the dates are on the same day
 */
export function isSameDay(dateLeft: Date, dateRight: Date): boolean {
  return (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getDate() === dateRight.getDate()
  )
}

/**
 * Checks if a date is in the past.
 * @param date The date to check
 * @returns True if the date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now()
}

/**
 * Checks if a date is in the future.
 * @param date The date to check
 * @returns True if the date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now()
}

/**
 * Adds a number of days to a date.
 * @param date The date to add days to
 * @param amount The amount of days to add
 * @returns A new Date object with the added days
 */
export function addDays(date: Date, amount: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}
