/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { PlayerService } from './player.service';

describe('Service: Player', () => {
  beforeEach(() => {
    addProviders([PlayerService]);
  });

  it('should ...',
    inject([PlayerService],
      (service: PlayerService) => {
        expect(service).toBeTruthy();
      }));
});
