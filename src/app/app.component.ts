import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  minDate1 = new Date('2023/07/31');

  constructor(private fb: FormBuilder) {
    this.formGroup = fb.group({
      customDate1: ['', [Validators.required]],
    });
  }

  formGroup: FormGroup = new FormGroup({});

  onFullDateChange(selectedDate: string, formControlName: string) {
    this.formGroup.get(formControlName)?.setValue(selectedDate);
  }

  get customDate1(): string {
    return this.formGroup.get('customDate1')?.value;
  }

  get customDate2(): string {
    return this.formGroup.get('customDate2')?.value;
  }

  onSubmit() {
    if (this.formGroup.status !== 'INVALID') {
      console.log(this.formGroup);
      console.log(this.formGroup.value);
    } else {
      alert('error');
      console.log(this.customDate1);
    }
  }
}
