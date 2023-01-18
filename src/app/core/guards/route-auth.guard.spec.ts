import { TestBed } from '@angular/core/testing';

import { RouteAuthGuard } from './route-auth.guard';

describe('RouteAuthGuard', () => {
  let guard: RouteAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RouteAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
