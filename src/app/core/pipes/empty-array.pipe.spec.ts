import { EmptyArrayPipe } from './empty-array.pipe';

describe('EmptyArrayPipe', () => {
  it('create an instance', () => {
    const pipe = new EmptyArrayPipe();
    expect(pipe).toBeTruthy();
  });
});
