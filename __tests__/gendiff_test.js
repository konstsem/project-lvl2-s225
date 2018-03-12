import gendiff from '../src';

test('gendiff step2 (json)', () => {
  expect(gendiff('__tests__/__textures__/before.json', '__tests__/__textures__/after.json'))
    .toBe(`{
    host: hexlet.io
  + timeout: 20
  - timeout: 50
  - proxy: 123.234.53.22
  + verbose: true
}`);
});
