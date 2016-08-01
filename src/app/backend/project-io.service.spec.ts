/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { ProjectIOService } from './project-io.service';

describe('Service: ProjectIo', () => {
  beforeEach(() => {
    addProviders([ProjectIOService]);
  });

  it('should ...',
    inject([ProjectIOService],
      (service: ProjectIOService) => {
        expect(service).toBeTruthy();
      }));
});
