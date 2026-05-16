import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'darkMode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _darkMode = signal<boolean>(this.getInitialTheme());
  readonly darkMode = this._darkMode.asReadonly();

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        const isDark = this._darkMode();

        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
      });
    }
  }

  toggleDarkMode() {
    this._darkMode.update(v => !v);
  }

  setDarkMode(value: boolean) {
    this._darkMode.set(value);
  }

  private getInitialTheme(): boolean {
    if (typeof window === 'undefined') return false;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return JSON.parse(saved);

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}