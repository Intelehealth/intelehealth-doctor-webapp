import { Injectable } from '@angular/core';

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
}

@Injectable({
  providedIn: 'root'
})
export class NepaliDateService {
  private readonly BS_MONTHS_DATA: number[][] = [
    [365, 30,32,31,32,31,30,30,30,29,30,29,31],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,29,30,31],
    [365, 30,32,31,32,31,30,30,30,29,30,29,31],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,29,30,31],
    [365, 31,31,31,32,31,31,29,30,30,29,29,31],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,29,30,31],
    [365, 31,31,31,32,31,31,29,30,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,29,30,31],
    [365, 31,31,31,32,31,31,29,30,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,31,32,31,31,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,31,32,31,31,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 30,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,31,29,30,30,29,29,31],
    [365, 30,31,31,32,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,31,30,29,30,29,30,30],
    [365, 31,31,31,32,31,31,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,31,32,31,31,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,31,29,30,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,31],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,32,31,32,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,31,32,32,31,30,30,29,30,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,29,30,31],
    [365, 31,31,31,32,31,31,29,30,30,29,29,31],
    [365, 31,31,32,31,31,31,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,32,31,32,31,30,30,30,29,29,30,30],
    [366, 31,32,31,32,31,30,30,30,29,30,29,31],
    [365, 30,31,32,31,31,30,30,29,30,29,30,30],
    [365, 31,31,32,31,31,30,30,29,30,29,30,30]
  ];

  private readonly BS_YEAR_START = 2000;
  private readonly REF_AD_YEAR = 1943;
  private readonly REF_AD_MONTH_INDEX = 3;
  private readonly REF_AD_DAY = 14;

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
    const endYear = maxYear || (this.BS_YEAR_START + this.BS_MONTHS_DATA.length - 1);
    const years: number[] = [];

    for (let year = endYear; year >= this.BS_YEAR_START; year--) {
      years.push(year);
    }

    return years;
  }

  getDaysInBsMonth(bsYear: number, bsMonth: number): number {
    const yearIndex = bsYear - this.BS_YEAR_START;

    if (!this.BS_MONTHS_DATA[yearIndex] || bsMonth < 1 || bsMonth > 12) {
      return 30;
    }

    return this.BS_MONTHS_DATA[yearIndex][bsMonth];
  }

  bsToGregorian(bsYear: number, bsMonth: number, bsDay: number): Date | null {
    const yearIndex = bsYear - this.BS_YEAR_START;

    if (!this.BS_MONTHS_DATA[yearIndex] || bsMonth < 1 || bsMonth > 12) {
      return null;
    }

    const daysInMonth = this.getDaysInBsMonth(bsYear, bsMonth);
    if (bsDay < 1 || bsDay > daysInMonth) {
      return null;
    }

    let totalDays = 0;

    for (let year = 0; year < yearIndex; year++) {
      totalDays += this.BS_MONTHS_DATA[year][0];
    }

    for (let month = 1; month < bsMonth; month++) {
      totalDays += this.BS_MONTHS_DATA[yearIndex][month];
    }

    totalDays += (bsDay - 1);

    const adDate = new Date(this.REF_AD_YEAR, this.REF_AD_MONTH_INDEX, this.REF_AD_DAY, 12, 0, 0, 0);
    adDate.setDate(adDate.getDate() + totalDays);
    adDate.setHours(12, 0, 0, 0);

    return adDate;
  }

  gregorianToBs(gregorianDate: Date | string): NepaliDate | null {
    const target = this.normalizeDate(gregorianDate);

    if (!target) {
      return null;
    }

    const refDate = new Date(this.REF_AD_YEAR, this.REF_AD_MONTH_INDEX, this.REF_AD_DAY, 12, 0, 0, 0);
    const diffMs = target.getTime() - refDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return null;
    }

    let remaining = diffDays;
    let yearIndex = 0;
    let bsYear = this.BS_YEAR_START;

    while (yearIndex < this.BS_MONTHS_DATA.length && remaining >= this.BS_MONTHS_DATA[yearIndex][0]) {
      remaining -= this.BS_MONTHS_DATA[yearIndex][0];
      bsYear += 1;
      yearIndex += 1;
    }

    if (yearIndex >= this.BS_MONTHS_DATA.length) {
      return null;
    }

    let bsMonth = 1;
    let bsDay = 1;

    for (let month = 1; month <= 12; month++) {
      const daysInMonth = this.BS_MONTHS_DATA[yearIndex][month];
      if (remaining < daysInMonth) {
        bsMonth = month;
        bsDay = remaining + 1;
        break;
      }
      remaining -= daysInMonth;
    }

    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay
    };
  }

  formatBsDate(date: NepaliDate | null): string {
    if (!date) {
      return '';
    }

    return `${this.pad(date.day)} ${this.monthNames[date.month - 1]} ${date.year}`;
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
