/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { TimePipe } from './time.pipe';

describe('Pipe: Time', () => {
  it('create an instance', () => {
    let pipe = new TimePipe();
    expect(pipe).toBeTruthy();
  });
});
