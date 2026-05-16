import { Injectable, signal, computed } from '@angular/core';
import { UserRole } from '../../../shared/enums/user-role.enum';

export interface User {
  email: string;
  fullName: string;
  roles: string[];
  image?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  expiredAt: number | null;
}

const STORAGE_KEY = 'auth_data';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private state = signal<AuthState>(this.loadFromStorage());

  // Core computed signals
  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => !!this.state().token && !this.isExpired());

  // Role computed signals
  private roles = computed(() => new Set(this.state().user?.roles ?? []));

  readonly isAdmin = computed(() => this.roles().has(UserRole.Admin));
  readonly isCustomer = computed(() => this.roles().has(UserRole.Customer));
  readonly isEditor = computed(() => this.roles().has(UserRole.Editor));
  readonly isSalesPerson = computed(() => this.roles().has(UserRole.SalesPerson));
  readonly isShipper = computed(() => this.roles().has(UserRole.Shipper));
  readonly isAssistant = computed(() => this.roles().has(UserRole.Assistant));
  readonly isStaff = computed(() => this.isAuthenticated() && !this.isCustomer());

  // Init
  constructor() {
    if (this.isExpired()) {
      this.logout();
    }
  }

  // API
  login(token: string, user: User, expiresIn: number) {
    const expiredAt = Date.now() + expiresIn;
    const newState: AuthState = { token, user, expiredAt };

    this.state.set(newState);
    this.saveToStorage(newState);
  }

  logout() {
    this.state.set({ token: null, user: null, expiredAt: null });
    localStorage.removeItem(STORAGE_KEY);
  }

  updateUser(user: Partial<User>) {
    const current = this.state();
    if (!current.token || !current.user) return;

    const newState: AuthState = {
      ...current,
      user: { ...current.user, ...user },
    };

    this.state.set(newState);
    this.saveToStorage(newState);
  }

  // Helpers
  private isExpired(): boolean {
    const expiredAt = this.state().expiredAt;
    if (!expiredAt) return true;
    return Date.now() >= expiredAt;
  }

  private saveToStorage(state: AuthState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private loadFromStorage(): AuthState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return this.emptyState();

      const parsed = JSON.parse(data) as AuthState;

      // Validate structure
      if (!parsed.token) return this.emptyState();

      // Check expiration
      if (parsed.expiredAt && Date.now() >= parsed.expiredAt) {
        localStorage.removeItem(STORAGE_KEY);
        return this.emptyState();
      }

      return parsed;
    } catch {
      return this.emptyState();
    }
  }

  private emptyState(): AuthState {
    return { token: null, user: null, expiredAt: null };
  }
}