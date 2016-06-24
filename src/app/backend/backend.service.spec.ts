/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { BackendService } from './backend.service';

describe('Backend Service', () => {
  beforeEachProviders(() => [BackendService]);

  it('should ...',
      inject([BackendService], (service: BackendService) => {
    expect(service).toBeTruthy();
  }));
});
