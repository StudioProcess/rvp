/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { AnnotationComponent } from './annotation.component';

describe('Component: Annotation', () => {
  it('should create an instance', () => {
    let component = new AnnotationComponent();
    expect(component).toBeTruthy();
  });
});
