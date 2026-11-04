import { Injectable } from '@angular/core';
import NepaliDateConverter, { dateConfigMap } from 'nepali-date-converter';

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

/*
 * BS <-> AD conversion backed by nepali-date-converter, the same library the
 * FHW mobile app uses, so both apps always show the same BS date.
 */
@Injectable({
  providedIn: 'root'
})
export class NepaliDateService {
  private readonly BS_YEAR_START = 2000;
  private readonly BS_YEAR_END = 2090;
  /* AD date of 1 Baisakh 2000 BS; the library mirrors earlier dates instead of rejecting them. */
  private readonly AD_RANGE_START = new Date(1943, 3, 14, 0, 0, 0, 0);

  private readonly configMonthKeys = [
    'Baisakh',
    'Jestha',
    'Asar',
    'Shrawan',
    'Bhadra',
    'Aswin',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra'
  ] as const;

  readonly monthNames = [
    'Baisakh',
    'Jestha',
    'Ashadh',
    'Shrawan',
    'Bhadra',
    'Ashwin',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra'
  ];

  getTodayBs(): NepaliDate | null {
    return this.gregorianToBs(new Date());
  }

  getSupportedBsYears(maxYear?: number): number[] {
    const endYear = maxYear || this.BS_YEAR_END;
    const years: number[] = [];

    for (let year = endYear; year >= this.BS_YEAR_START; year--) {
      years.push(year);
    }

    return years;
  }

  getDaysInBsMonth(bsYear: number, bsMonth: number): number {
    const yearConfig = dateConfigMap[String(bsYear)];

    if (!yearConfig || bsMonth < 1 || bsMonth > 12) {
      return 30;
    }

    return yearConfig[this.configMonthKeys[bsMonth - 1]];
  }

  bsToGregorian(bsYear: number, bsMonth: number, bsDay: number): Date | null {
    if (!dateConfigMap[String(bsYear)] || bsMonth < 1 || bsMonth > 12) {
      return null;
    }

    if (bsDay < 1 || bsDay > this.getDaysInBsMonth(bsYear, bsMonth)) {
      return null;
    }

    try {
      const adDate = new NepaliDateConverter(bsYear, bsMonth - 1, bsDay).toJsDate();
      return new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate(), 12, 0, 0, 0);
    } catch {
      return null;
    }
  }

  gregorianToBs(gregorianDate: Date | string): NepaliDate | null {
    const target = this.normalizeDate(gregorianDate);

    if (!target || target < this.AD_RANGE_START) {
      return null;
    }

    try {
      const bsDate = new NepaliDateConverter(target);
      return {
        year: bsDate.getYear(),
        month: bsDate.getMonth() + 1,
        day: bsDate.getDate()
      };
    } catch {
      return null;
    }
  }

  formatBsDate(date: NepaliDate | null): string {
    if (!date) {
      return '';
    }

    return `${this.pad(date.day)} ${this.monthNames[date.month - 1]} ${date.year} BS`;
  }

  toGregorianIsoString(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = this.pad(date.getMonth() + 1);
    const day = this.pad(date.getDate());

    return `${year}-${month}-${day}`;
  }

  private normalizeDate(value: Date | string): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setHours(12, 0, 0, 0);
    return date;
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
