/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { PlayheadComponent } from './playhead.component';

describe('Component: Playhead', () => {
  it('should create an instance', () => {
    let component = new PlayheadComponent();
    expect(component).toBeTruthy();
  });
});
