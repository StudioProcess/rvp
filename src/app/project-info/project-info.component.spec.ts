/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { ProjectInfoComponent } from './project-info.component';

describe('Component: ProjectInfo', () => {
  it('should create an instance', () => {
    let component = new ProjectInfoComponent();
    expect(component).toBeTruthy();
  });
});
