import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberUtilService {

  constructor() { }
  
  round(num: number, digits = 2): number {
    return Number(num.toFixed(digits));
  }
}
