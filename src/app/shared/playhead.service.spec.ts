/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { PlayheadService } from './playhead.service';

describe('Service: Playhead', () => {
  beforeEach(() => {
    addProviders([PlayheadService]);
  });

  it('should ...',
    inject([PlayheadService],
      (service: PlayheadService) => {
        expect(service).toBeTruthy();
      }));
});
