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

import * as jalaliMoment from 'jalali-moment';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent implements AfterViewInit, OnInit, OnChanges {
  //? You can set a Optional Range for the Date
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  year: string = '';
  month: string = '';
  day: string = '';

  calender: FormControl<Date | null> = new FormControl(null);

  //! Result of this component Stores here
  get date(): string {
    const formattedYear = this.year.padStart(4, '0');
    const formattedMonth = this.month.padStart(2, '0');
    const formattedDay = this.day.padStart(2, '0');
    return `${formattedYear}/${formattedMonth}/${formattedDay}`;
  }

  //? Passing Through the result for Parents components
  @Output() fullDate: EventEmitter<string> = new EventEmitter<string>();

  emitFullDate(): void {
    if (this.formGroup.status === 'VALID') {
      const selectedDate = this.date;
      this.fullDate.emit(selectedDate);
    } else {
      console.log('invalid');
    }
  }

  //* Setting the values of calender inside input and year/month/day values
  constructor(private fb: FormBuilder) {
    this.calender.valueChanges.subscribe((selectedDate) => {
      if (selectedDate) {
        const jalaliDate = jalaliMoment(selectedDate);
        this.year = jalaliDate.jYear().toString();
        this.month = (jalaliDate.jMonth() + 1).toString().padStart(2, '0');
        this.day = jalaliDate.jDate().toString().padStart(2, '0');
      } else {
        this.year = '';
        this.month = '';
        this.day = '';
      }

      this.emitFullDate();
    });

    this.updateDayInputValidation();
  }

  //*Creating a Form Group
  formGroup: FormGroup = new FormGroup({});

  ngOnInit(): void {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year'] || changes['month']) {
      this.updateDayInputValidation();
    }
  }

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

  dateRangeValidator(
    minDate: Date | undefined,
    maxDate: Date | undefined
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(
        `${control.value.year}-${control.value.month}-${control.value.day}`
      );

      if (minDate && selectedDate < minDate) {
        return { minDate: true };
      }

      if (maxDate && selectedDate > maxDate) {
        return { maxDate: true };
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const { key } = event;

    if (key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Backspace') {
      this.navigateInputs(key);
    }
  }

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

  //* non-Numeric Validation and next input selection after month input is filled
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

  //* non-Numeric Validation and next input selection after month input is filled
  onMonthInput(event: KeyboardEvent): void {
    if (!this.isNumericInput(event)) {
      this.month = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    }
    if (this.year.length === 4 && this.month.length === 2) {
      this.dayInput.nativeElement.focus();
    }

    this.emitFullDate();
  }

  //* non-Numeric Validation for Day input
  onDayInput(event: KeyboardEvent): void {
    if (!this.isNumericInput(event)) {
      this.day = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    }

    this.emitFullDate();
  }

  //* Converting 1 -> 01
  onFocusOut(event: FocusEvent, inputName: string) {
    const value = (event.target as HTMLInputElement).value;
    const maxLength = inputName === 'year' ? 4 : 2;
    if (value.length < maxLength && value !== '') {
      const paddedValue = value.padStart(maxLength, '0');
      this.formGroup.patchValue({ [inputName]: paddedValue });
    }
    // debugger;
    // const year = parseInt(this.year);
    // const month = parseInt(this.month);
    // const day = parseInt(this.day);
    // const newDate = new Date(year, month, day);

    // const jalaliDate = jalaliMoment(newDate);
    // this.year = jalaliDate.jYear().toString();
    // this.month = jalaliDate.jMonth().toString().padStart(2, '0');
    // this.day = jalaliDate.jDate().toString().padStart(2, '0');

    // const finalDate = new Date(year, month, day);

    // console.log('year: ' + finalDate.getDate());

    // this.calender.setValue(finalDate);
  }

  //* Navigating between inputs focus base on keydown events
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
    } else if (key === 'ArrowLeft') {
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
  }
}
