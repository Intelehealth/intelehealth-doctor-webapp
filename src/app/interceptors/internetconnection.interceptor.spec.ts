import { TestBed } from '@angular/core/testing';

import { InternetconnectionInterceptor } from './internetconnection.interceptor';

describe('InternetconnectionInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InternetconnectionInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: InternetconnectionInterceptor = TestBed.inject(InternetconnectionInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
