import { Injectable } from '@angular/core';

import { AsyncFailable, Fail, HasFailed } from 'picsur-shared/dist/types';
import {
  ApiResponse,
  ApiSuccessResponse,
} from 'picsur-shared/dist/dto/api.dto';
import { validate } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { MultiPartRequest } from '../models/multi-part-request';
import { KeyService } from './key.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private keyService: KeyService) {}

  public async get<T extends Object>(
    type: ClassConstructor<T>,
    url: string
  ): AsyncFailable<T> {
    return this.fetchSafeJson(type, url, { method: 'GET' });
  }

  public async post<T extends Object, W extends Object>(
    sendType: ClassConstructor<T>,
    receiveType: ClassConstructor<W>,
    url: string,
    data: object
  ): AsyncFailable<W> {
    const sendClass = plainToClass(sendType, data);
    const errors = await validate(sendClass);
    if (errors.length > 0) {
      console.warn(errors);
      return Fail('Something went wrong');
    }

    return this.fetchSafeJson(receiveType, url, {
      method: 'POST',
      body: JSON.stringify(sendClass),
    });
  }

  public async postForm<T extends Object>(
    receiveType: ClassConstructor<T>,
    url: string,
    data: MultiPartRequest
  ): AsyncFailable<T> {
    return this.fetchSafeJson(receiveType, url, {
      method: 'POST',
      body: data.createFormData(),
    });
  }

  private async fetchSafeJson<T extends Object>(
    type: ClassConstructor<T>,
    url: RequestInfo,
    options: RequestInit
  ): AsyncFailable<T> {
    let result = await this.fetchJsonAs<ApiResponse<T>>(url, options);
    if (HasFailed(result)) return result;

    if (result.success === false) return Fail(result.data.message);

    const resultClass = plainToClass<
      ApiSuccessResponse<T>,
      ApiSuccessResponse<T>
    >(ApiSuccessResponse, result);
    const resultErrors = await validate(resultClass);
    if (resultErrors.length > 0) {
      console.warn('result', resultErrors);
      return Fail('Something went wrong');
    }

    const dataClass = plainToClass(type, result.data);
    const dataErrors = await validate(dataClass);
    if (dataErrors.length > 0) {
      console.warn('data', dataErrors);
      return Fail('Something went wrong');
    }

    return result.data;
  }

  private async fetchJsonAs<T>(
    url: RequestInfo,
    options: RequestInit
  ): AsyncFailable<T> {
    const response = await this.fetch(url, options);
    if (HasFailed(response)) {
      return response;
    }
    try {
      return await response.json();
    } catch (e) {
      console.warn(e);
      return Fail('Something went wrong');
    }
  }

  private async fetchBuffer(
    url: RequestInfo,
    options: RequestInit
  ): AsyncFailable<ArrayBuffer> {
    const response = await this.fetch(url, options);
    if (HasFailed(response)) return response;

    try {
      return await response.arrayBuffer();
    } catch (e) {
      console.warn(e);
      return Fail('Something went wrong');
    }
  }

  private async fetch(
    url: RequestInfo,
    options: RequestInit
  ): AsyncFailable<Response> {
    try {
      const key = this.keyService.get();
      const isJSON = typeof options.body === 'string';

      const headers: any = options.headers || {};
      if (key !== null)
        headers['Authorization'] = `Bearer ${this.keyService.get()}`;
      if (isJSON) headers['Content-Type'] = 'application/json';
      options.headers = headers;

      return await window.fetch(url, options);
    } catch (e: any) {
      console.warn(e);
      return Fail('Something went wrong');
    }
  }
}