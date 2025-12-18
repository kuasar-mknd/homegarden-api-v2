/**
 * Result Type
 * 
 * A functional error handling pattern for explicit success/failure cases.
 */

export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  success: true
  data: T
}

export interface Failure<E> {
  success: false
  error: E
}

export const ok = <T>(data: T): Success<T> => ({
  success: true,
  data,
})

export const fail = <E>(error: E): Failure<E> => ({
  success: false,
  error,
})

// Type guard
export const isOk = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.success === true
}

export const isFail = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.success === false
}
