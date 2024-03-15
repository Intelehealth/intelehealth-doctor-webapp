import { NoValuePipe } from './no-value.pipe';

describe('NoValuePipe', () => {
  it('create an instance', () => {
    const pipe = new NoValuePipe();
    expect(pipe).toBeTruthy();
  });
});
