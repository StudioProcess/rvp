/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { addProviders, async, inject } from '@angular/core/testing';
import { IoComponent } from './io.component';

describe('Component: Io', () => {
  it('should create an instance', () => {
    let component = new IoComponent();
    expect(component).toBeTruthy();
  });
});
