import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'darkMode';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _darkMode = signal<boolean>(this.getInitialTheme());

  darkMode = this._darkMode.asReadonly();

  constructor() {
    effect(() => {
      const isDark = this._darkMode();

      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
    });
  }

  toggleDarkMode() {
    this._darkMode.update(v => !v);
  }

  setDarkMode(value: boolean) {
    this._darkMode.set(value);
  }

  private getInitialTheme(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}