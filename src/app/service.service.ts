import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private currentLanguage: string = localStorage.getItem('language') || 'fa';

  getLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(newLanguage: string): void {
    this.currentLanguage = newLanguage;
    localStorage.setItem('language', newLanguage)
  }
}
