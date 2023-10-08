import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from './service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  minDate1 = '1300/01/10'
  maxDate1 = '1500/01/01'
  constructor(private fb: FormBuilder, private languageService: ServiceService) {
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

  onSubmit() {
    if (this.formGroup.status !== 'INVALID') {
      console.log(this.formGroup);
      console.log(this.formGroup.value);
    } else {
      alert('error');
      console.log(this.customDate1);
    }
  }

  setLang() {
   if(this.languageService.getLanguage() === 'fa') {
    this.languageService.setLanguage('en')
   } else {
    this.languageService.setLanguage('fa')
   }
   window.location.reload()
  }
}
