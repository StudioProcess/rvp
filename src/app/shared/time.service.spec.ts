/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { TimeService } from './time.service';

describe('Service: Time', () => {
  beforeEach(() => {
    addProviders([TimeService]);
  });

  it('should ...',
    inject([TimeService],
      (service: TimeService) => {
        expect(service).toBeTruthy();
      }));
});
