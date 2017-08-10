/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { SimpleBackendService } from './simple-backend.service';

describe('SimpleBackend Service', () => {
  beforeEachProviders(() => [SimpleBackendService]);

  it('should ...',
      inject([SimpleBackendService], (service: SimpleBackendService) => {
    expect(service).toBeTruthy();
  }));
});
