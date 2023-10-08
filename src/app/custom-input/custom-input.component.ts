import {
  AfterViewInit,
  OnInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  Input,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import * as moment from 'jalali-moment';

import * as jalaliMoment from 'jalali-moment';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInputComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  englishMinDate_Date?: Date;
  englishMaxDate_Date?: Date;

  @Input() label: string = '';

  @Input() defaultValues?: string;

  hasError: boolean = true;

  year: string = '';
  month: string = '';
  day: string = '';

  calender: FormControl<Date | null> = new FormControl(null);

  formGroup: FormGroup = new FormGroup({});

  //! Result of this component Stores here
  get date(): string {
    const formattedYear = this.year.padStart(4, '0');
    const formattedMonth = this.month.padStart(2, '0');
    const formattedDay = this.day.padStart(2, '0');
    return `${formattedYear}/${formattedMonth}/${formattedDay}`;
  }

  updateInputs() {
    if (this.defaultValues) {
      const parts = this.defaultValues.split('/');

      this.year = parts[0] || '';
      this.month = parts[1] || '';
      this.day = parts[2] || '';

      const yearNumber = parseInt(this.year);
      const monthNumber = parseInt(this.month);
      const dayNumber = parseInt(this.day);

      if (
        this.formGroup.status === 'VALID' &&
        !isNaN(yearNumber) &&
        !isNaN(monthNumber) &&
        !isNaN(dayNumber)
      ) {
        const englishDate = moment
          .from(`${this.year}/${this.month}/${this.day}`, 'fa', 'YYYY/MM/DD')
          .format('YYYY/MM/DD');
        const updatedDate = this.stringToDate(englishDate);

        this.calender.setValue(updatedDate);
      }
      this.emitFullDate();
    }
  }

  //? Passing Through the result for Parents components
  @Output() fullDate: EventEmitter<string> = new EventEmitter<string>();

  emitFullDate(): void {
    if (this.formGroup.status === 'VALID') {
      this.hasError = false;
      const selectedDate = this.date;
      this.fullDate.emit(selectedDate);
    } else {
      console.log('invalid');
    }

    setTimeout(() => {
      // Manually trigger change detection after the setTimeout
      this.cd.detectChanges();
    });
  }

  //* Setting the values of calender inside input and year/month/day values
  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef, private language: ServiceService) {
    this.checkForMinMax();
  
    this.calender.valueChanges.subscribe((selectedDate) => {
      if (selectedDate) {
        if (this.language.getLanguage() === 'fa'){
        const jalaliDate = jalaliMoment(selectedDate);
        this.year = jalaliDate.jYear().toString();
        this.month = (jalaliDate.jMonth() + 1).toString().padStart(2, '0');
        this.day = jalaliDate.jDate().toString().padStart(2, '0');
        } else {
          this.year = selectedDate.getFullYear().toString()
          this.month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
          this.day = selectedDate.getDate().toString().padStart(2, '0');
        }
      } else {
        this.year = '';
        this.month = '';
        this.day = '';
      }
      // setTimeout will fix the problem of formGroup for first time user select the date on calender
      setTimeout(() => {
        this.emitFullDate();
      }, 0);
    });

    this.updateDayInputValidation();
  }

  updateCalender(): void {
    const yearNumber = parseInt(this.formGroup.get('year')?.value, 10);
    const monthNumber = parseInt(this.formGroup.get('month')?.value, 10);
    const dayNumber = parseInt(this.formGroup.get('day')?.value, 10);

    if (
      this.formGroup.status === 'VALID' &&
      !isNaN(yearNumber) &&
      !isNaN(monthNumber) &&
      !isNaN(dayNumber)
    ) {
      const englishDate = moment
        .from(`${this.year}/${this.month}/${this.day}`, 'fa', 'YYYY/MM/DD')
        .format('YYYY/MM/DD');
      const updatedDate = this.stringToDate(englishDate);

      this.calender.setValue(updatedDate);
    }
  }

  ngOnInit(): void {
    this.updateInputs();
    this.formGroup = this.fb.group(
      {
        year: ['', [Validators.required]],
        month: [
          '',
          [Validators.required, Validators.pattern(/^(0?[1-9]|1[0-2])$/)],
        ],
        day: ['', [Validators.required, this.dayValidator()]],
      },
      {
        validators: [this.dateRangeValidator(this.minDate, this.maxDate)],
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minDate'] || changes['maxDate']) {
      this.checkForMinMax();
    }
    if (changes['defaultValues']) {
      setTimeout(() => {
        this.updateInputs();
      }, 0);
    }
    if (changes['year'] || changes['month']) {
      this.updateDayInputValidation();
    }
  }

  checkForMinMax() {
    setTimeout(() => {
      const minDateFormat = this.stringToDate(this.minDate);
      const newMinDate = this.convertPersianDateToEnglish(minDateFormat!);
      this.englishMinDate_Date = newMinDate;

      const maxDateFormat = this.stringToDate(this.maxDate);
      const newMaxDate = this.convertPersianDateToEnglish(maxDateFormat!);
      this.englishMaxDate_Date = newMaxDate;
    }, 0);
  }

  //? Form Validation
  formValidation(): boolean {
    const getYear = this.formGroup.get('year');
    const getMonth = this.formGroup.get('month');
    const getDay = this.formGroup.get('day');
    if (
      (getYear?.invalid && getYear?.touched) ||
      (getMonth?.invalid && getMonth?.touched) ||
      (getDay?.invalid && getDay?.touched) ||
      this.formGroup.errors !== null
    ) {
      return true;
    } else {
      return false;
    }
  }
  //* Day number Validation base on it's Month
  dayValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const monthNumber = parseInt(this.month, 10);
      const dayNumber = parseInt(control.value, 10);
      let maxDays = 31;

      if (monthNumber === 2) {
        const yearNumber = parseInt(this.year, 10);
        maxDays = this.isLeapYear(yearNumber) ? 29 : 28;
      } else if ([4, 6, 9, 11].includes(monthNumber)) {
        maxDays = 30;
      }

      if (dayNumber < 1 || dayNumber > maxDays) {
        return { invalidDay: true };
      }

      return null;
    };
  }

  updateDayInputValidation(): void {
    this.formGroup
      .get('day')
      ?.setValidators([Validators.required, this.dayValidator()]);
    this.formGroup.get('day')?.updateValueAndValidity();
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  dateRangeValidator(minDate: string, maxDate: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(
        `${control.value.year}/${control.value.month}/${control.value.day}`
      );

      if (minDate) {
        const newMinDate_Date = this.stringToDate(minDate);
        if (newMinDate_Date && selectedDate < newMinDate_Date) {
          return { minDate: true };
        }
      }
      if (maxDate) {
        const newMaxDate_Date = this.stringToDate(maxDate);
        if (newMaxDate_Date && selectedDate > newMaxDate_Date) {
          return { maxDate: true };
        }
      }

      return null;
    };
  }

  yearError() {
    let yearError = this.formGroup.get('year')?.errors;
    if (yearError?.['minDate'] || yearError?.['maxDate']) {
      return true;
    } else {
      return false;
    }
  }

  monthError() {
    let monthError = this.formGroup.get('month')?.errors;
    if (monthError?.['minDate'] || monthError?.['maxDate']) {
      return true;
    } else {
      return false;
    }
  }

  dayError() {
    let dayError = this.formGroup.get('day')?.errors;
    if (dayError?.['minDate'] || dayError?.['maxDate']) {
      return true;
    } else {
      return false;
    }
  }
  //?

  //? Converting Functions
  stringToDate(dateString: string): Date | null {
    if (dateString) {
      const dateParts = dateString.split('/');
      if (dateParts.length !== 3) {
        return null;
      }

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are zero-based (0 - 11)
      const day = parseInt(dateParts[2], 10);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }

      const date = new Date(year, month, day);

      return date;
    }
    return null;
  }

  convertPersianDateToEnglish(persianDate: Date | null): Date | undefined {
    if (persianDate === null) return undefined;
    const year = persianDate.getFullYear();
    const month = persianDate.getMonth() + 1;
    const day = persianDate.getDate();

    const persianDateString = `${year}/${month}/${day}`;

    const newPersianDate = jalaliMoment(persianDateString, 'jYYYY/jM/jD');
    const gregorianDate = newPersianDate.toDate();
    return gregorianDate;
  }

  englishToPersianDate(DateValue: Date): Date {
    const jalaliDate = jalaliMoment(DateValue);
    const year = jalaliDate.jYear().toString();
    const month = (jalaliDate.jMonth() + 1).toString().padStart(2, '0');
    const day = jalaliDate.jDate().toString().padStart(2, '0');

    return new Date(`${year}/${month}/${day}`);
  }
  //?

  @ViewChild('yearInput', { static: false }) yearInput!: ElementRef;
  @ViewChild('monthInput', { static: false }) monthInput!: ElementRef;
  @ViewChild('dayInput', { static: false }) dayInput!: ElementRef;

  ngAfterViewInit(): void {
    this.yearInput.nativeElement.addEventListener('input', (e: KeyboardEvent) =>
      this.onYearInput(e)
    );
    this.monthInput.nativeElement.addEventListener(
      'input',
      (e: KeyboardEvent) => this.onMonthInput(e)
    );
    this.dayInput.nativeElement.addEventListener('input', (e: KeyboardEvent) =>
      this.onDayInput(e)
    );
  }

  //? non-Numeric Validation
  private isNumericInput(event: KeyboardEvent): boolean {
    const pattern = /^[0-9]$/;
    return pattern.test(event.key);
  }

  onYearInput(event: KeyboardEvent): void {
    if (!this.isNumericInput(event)) {
      this.year = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    }
    if (this.year.length === 4) {
      this.monthInput.nativeElement.focus();
    }

    this.emitFullDate();
  }

  onMonthInput(event: KeyboardEvent): void {
    if (!this.isNumericInput(event)) {
      this.month = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    }
    if (this.year.length === 4 && this.month.length === 2) {
      this.dayInput.nativeElement.focus();
    }

    this.emitFullDate();
  }

  onDayInput(event: KeyboardEvent): void {
    if (!this.isNumericInput(event)) {
      this.day = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    }

    this.emitFullDate();
  }
  //?

  //* Converting 1 -> 01
  onFocusOut(event: FocusEvent, inputName: string) {
    const value = (event.target as HTMLInputElement).value;
    const maxLength = inputName === 'year' ? 4 : 2;
    if (value.length === maxLength) {
      this.updateCalender()
      return;
    }
    if (value.length < maxLength && value !== '') {
      const paddedValue = value.padStart(maxLength, '0');
      this.formGroup.patchValue({ [inputName]: paddedValue });
    }
    this.updateCalender();
  }

  //? Navigating between inputs focus base on keydown events
  navigateInputs(key: string): void {
    const activeElement = document.activeElement as HTMLInputElement;

    const year = this.yearInput.nativeElement;
    const month = this.monthInput.nativeElement;
    const day = this.dayInput.nativeElement;

    if (key === 'ArrowRight') {
      if (activeElement === year) {
        if (year.selectionEnd === year.value.length) {
          month.focus();
        }
      } else if (activeElement === month) {
        if (month.selectionEnd === month.value.length) {
          day.focus();
        }
      }
    } else if (
      key === 'ArrowLeft' ||
      (key === 'Backspace' && activeElement.selectionStart === 0)
    ) {
      if (activeElement === day) {
        if (day.selectionStart === 0) {
          setTimeout(() => {
            month.setSelectionRange(month.value.length, month.value.length);
            month.focus();
          }, 0);
        }
      } else if (activeElement === month) {
        if (month.selectionStart === 0) {
          setTimeout(() => {
            year.setSelectionRange(year.value.length, year.value.length);
            year.focus();
          }, 0);
        }
      }
    } else if (key === 'Backspace') {
      if (activeElement === day && day.value.length === 0) {
        month.focus();
      } else if (activeElement === month && month.value.length === 0) {
        year.focus();
      } else {
        return;
      }
    }

    this.cd.detectChanges();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const { key } = event;

    if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Backspace') {
      this.navigateInputs(key);
    }
  }
  //?
}
