declare module 'bikram-sambat' {
  export function toBik(gregorianDate: string): { year: number; month: number; day: number };
  export function toGreg(year: number, month: number, day: number): { year: number; month: number; day: number };
}
