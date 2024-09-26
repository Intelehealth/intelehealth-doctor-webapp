import { TestBed } from '@angular/core/testing';

import { IhChatService } from './ih-chat.service';

describe('IhChatService', () => {
  let service: IhChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IhChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
