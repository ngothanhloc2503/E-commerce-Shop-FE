import { Injectable } from '@angular/core';

const TOKEN = "token";
const USER = "user";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  static updateUserPhoto(userPhoto: string): void {
    const user = JSON.parse(localStorage.getItem(USER) as string);
    if (user === null) { return }
    let expiredDate: Date = user.expiredDate;
    let value = user.value;
    value.image = userPhoto;

    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER, JSON.stringify({
      value: value,
      expiredDate: expiredDate
    }));
  }

  static saveUserInfoAndToken(user: any, token: string, expireDuration: number): void {
    let expiredDate: Date = new Date(new Date().getTime() + expireDuration);
    window.localStorage.removeItem(TOKEN);
    window.localStorage.setItem(TOKEN, JSON.stringify({
      value: token,
      expiredDate: expiredDate
    }));
    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER, JSON.stringify({
      value: user,
      expiredDate: expiredDate
    }));
  }

  static saveUser(user: any): void {
    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER, JSON.stringify(user));
  }

  static getToken() {
    const token = JSON.parse(window.localStorage.getItem(TOKEN) as string);
    if (token === null) { return null; }
    let expiredDate = token.expiredDate;
    if (new Date(expiredDate).getTime() < new Date().getTime()) {
      this.signOut();
      return null;
    }
    return token.value;
  }

  static getUser() {
    const user = JSON.parse(localStorage.getItem(USER) as string);
    if (user === null) { return null; }
    let expiredDate = user.expiredDate;
    if (new Date(expiredDate).getTime() < new Date().getTime()) {
      this.signOut();
      return null;
    }
    return user.value;
  }

  static getUserEmail() {
    const user = this.getUser();
    if (user == null) return "";
    return user.email;
  }

  static getUserImage() {
    const user = this.getUser();
    if (user == null) return "";
    return user.image;
  }

  static getUserFullName() {
    const user = this.getUser();
    if (user == null) return "";
    return user.fullName;
  }

  static getUserRoles() {
    const user = this.getUser();
    if (user == null) return "";
    return user.roles;
  }

  static isCustomerLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_CUSTOMER") >= 0;
  }

  static isStaffLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_CUSTOMER") < 0;
  }

  static isAdminLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_ADMIN") >= 0;
  }

  static isSalesPersonLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_SALESPERSON") >= 0;
  }

  static isEditorLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_EDITOR") >= 0;
  }

  static isShipperLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_SHIPPER") >= 0;
  }

  static isAssistantLoggedIn(): boolean {
    if (this.getToken() == null) return false;
    const roles = this.getUserRoles();
    return roles.indexOf("ROLE_ASSISTANT") >= 0;
  }

  static signOut(): void {
    window.localStorage.removeItem(TOKEN);
    window.localStorage.removeItem(USER);
  }
}
