import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { followUpDateToDate, followUpDateToString } from '../follow-up-date';

type CalendarView = 'day' | 'month' | 'year';

interface DayCell {
  date: Date;
  day: number;
  inMonth: boolean;
  disabled: boolean;
  selected: boolean;
  today: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS_PER_PAGE = 12;

/**
* Follow-up date field + calendar popup: ‹ [Jul ⌄] [2021 ⌄] ›, Mo–Su, a 6-week grid with the
* neighbouring months' days greyed, selected day in green. No Cancel/Okay — picking a day applies it.
* The value is the notes' "yyyy-mm-dd" string. Styles: visit-summary-v2.component.scss (.vs2-fu-cal-*).
*/
@Component({
  selector: 'app-follow-up-date-picker',
  templateUrl: './follow-up-date-picker.component.html'
})
export class FollowUpDatePickerComponent {
  /** Selected date, "yyyy-mm-dd" ('' = none). */
  @Input() value = '';
  /** Earliest pickable date, "yyyy-mm-dd" ('' = no limit). */
  @Input() min = '';
  @Input() placeholder = 'Enter date';
  @Output() valueChange = new EventEmitter<string>();

  readonly weekdays = ['Mo', 'Tu', 'W', 'Th', 'Fri', 'Sa', 'Su'];
  readonly months = MONTHS;
  /** Below the field; above it when there's no room. */
  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 }
  ];

  open = false;
  view: CalendarView = 'day';
  viewYear = 0;
  viewMonth = 0;
  weeks: DayCell[][] = [];
  years: number[] = [];

  get selectedDate(): Date | null {
    return followUpDateToDate(this.value);
  }

  private get minDate(): Date | null {
    return followUpDateToDate(this.min);
  }

  toggle(): void {
    this.open ? this.close() : this.openCalendar();
  }

  close(): void {
    this.open = false;
  }

  private openCalendar(): void {
    const start = this.selectedDate || this.minDate || this.today();
    this.viewYear = start.getFullYear();
    this.viewMonth = start.getMonth();
    this.view = 'day';
    this.buildDays();
    this.open = true;
  }

  // Header

  showMonths(): void {
    this.view = this.view === 'month' ? 'day' : 'month';
  }

  showYears(): void {
    if (this.view === 'year') {
      this.view = 'day';
      return;
    }
    this.buildYears(this.viewYear - (this.viewYear % YEARS_PER_PAGE));
    this.view = 'year';
  }

  previous(): void {
    this.step(-1);
  }

  next(): void {
    this.step(1);
  }

  canGoPrevious(): boolean {
    const min = this.minDate;
    if (!min) { return true; }
    switch (this.view) {
      case 'day': return new Date(this.viewYear, this.viewMonth, 0) >= min; // last day of the previous month
      case 'month': return this.viewYear - 1 >= min.getFullYear();
      default: return this.years[0] - 1 >= min.getFullYear();
    }
  }

  private step(direction: 1 | -1): void {
    if (this.view === 'day') {
      const d = new Date(this.viewYear, this.viewMonth + direction, 1);
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
      this.buildDays();
    } else if (this.view === 'month') {
      this.viewYear += direction;
    } else {
      this.buildYears(this.years[0] + direction * YEARS_PER_PAGE);
    }
  }

  // Month / year lists

  isMonthDisabled(month: number): boolean {
    const min = this.minDate;
    return !!min && new Date(this.viewYear, month + 1, 0) < min; // whole month before min
  }

  pickMonth(month: number): void {
    if (this.isMonthDisabled(month)) { return; }
    this.viewMonth = month;
    this.view = 'day';
    this.buildDays();
  }

  isYearDisabled(year: number): boolean {
    const min = this.minDate;
    return !!min && year < min.getFullYear();
  }

  pickYear(year: number): void {
    if (this.isYearDisabled(year)) { return; }
    this.viewYear = year;
    this.view = 'month';
  }

  // Days

  pickDay(cell: DayCell): void {
    if (cell.disabled) { return; }
    this.valueChange.emit(followUpDateToString(cell.date));
    this.close();
  }

  /** Always 6 weeks, Monday first, padded with the previous / next month's days. */
  private buildDays(): void {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const offset = (first.getDay() + 6) % 7; // days before the 1st, Monday-based
    const min = this.minDate;
    const selected = this.value;
    const today = followUpDateToString(this.today());
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(this.viewYear, this.viewMonth, 1 - offset + i);
      const key = followUpDateToString(date);
      cells.push({
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === this.viewMonth,
        disabled: !!min && date < min,
        selected: key === selected,
        today: key === today
      });
    }
    this.weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }

  private buildYears(firstYear: number): void {
    this.years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => firstYear + i);
  }

  private today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}
