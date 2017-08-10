/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { InspectorService } from './inspector.service';

describe('Service: Inspector', () => {
  beforeEach(() => {
    addProviders([InspectorService]);
  });

  it('should ...',
    inject([InspectorService],
      (service: InspectorService) => {
        expect(service).toBeTruthy();
      }));
});
