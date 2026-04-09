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

  user = computed(() => this.state().user);
  token = computed(() => this.state().token);
  isAuthenticated = computed(() => !!this.state().token);

  init() {
    const saved = this.loadFromStorage();
    this.state.set(saved);
  }

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

  // ===== ROLE CHECK =====
  hasRole(role: UserRole): boolean {
    return this.state().user?.roles?.includes(role) ?? false;
  }

  isAdmin() { return this.hasRole(UserRole.Admin); }
  isCustomer() { return this.hasRole(UserRole.Customer); }
  isEditor() { return this.hasRole(UserRole.Editor); }
  isSalesPerson() { return this.hasRole(UserRole.SalesPerson); }
  isShipper() { return this.hasRole(UserRole.Shipper); }
  isAssistant() { return this.hasRole(UserRole.Assistant); }

  private saveToStorage(state: AuthState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private loadFromStorage(): AuthState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { token: null, user: null, expiredAt: null };
      }

      return JSON.parse(data);
    } catch {
      return { token: null, user: null, expiredAt: null };
    }
  }

  updateUser(user: Partial<User>) {
    const current = this.state();
    if (!current.token || !current.user) return;

    const newState = {
      ...current,
      user: {
        ...current.user,
        ...user
      }
    };

    this.state.set(newState);
    this.saveToStorage(newState);
  }
}