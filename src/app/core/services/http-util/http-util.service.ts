import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpUtilService {

  constructor() { }

  createPagingParams(
    pageNum: number,
    pageSize: number,
    sortField: string,
    sortDir: string,
    keyword?: string
  ): HttpParams {
    return new HttpParams({
      fromObject: {
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortDir,
        keyword: keyword || ''
      }
    });
  }
}
