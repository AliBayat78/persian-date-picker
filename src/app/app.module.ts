import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomInputComponent } from './custom-input/custom-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MaterialPersianDateAdapter,
  PERSIAN_DATE_FORMATS,
} from './shared/material.persian-date.adapter';
import { LanguageService } from './language.service';


export function dateAdapterFactory(languageService: LanguageService) {
  return languageService.getLanguage() === 'fa' ? new MaterialPersianDateAdapter() : new NativeDateAdapter('en-US');
}

export function dateFormatsFactory(languageService: LanguageService) {
 return languageService.getLanguage() === 'fa' ? PERSIAN_DATE_FORMATS : MAT_NATIVE_DATE_FORMATS;
}
@NgModule({
  declarations: [AppComponent, CustomInputComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [
    // {
    //   provide: DateAdapter,
    //   useClass: MaterialPersianDateAdapter,
    //   deps: [MAT_DATE_LOCALE],
    // },
    // { provide: MAT_DATE_FORMATS, useValue: PERSIAN_DATE_FORMATS },
    { provide: DateAdapter, useFactory: dateAdapterFactory, deps: [LanguageService, MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useFactory: dateFormatsFactory, deps: [LanguageService] }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
