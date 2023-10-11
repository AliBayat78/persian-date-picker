import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  minDate1 = '1315/01/02'
  maxDate1 = '1500/01/02'
  constructor(private languageService: LanguageService) {}

  formGroup: FormGroup = new FormGroup({
    customDate1: new FormControl('', Validators.required)
  });

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
