import gendiff from '../src';

test('gendiff step2 (json)', () => {
  expect(gendiff('__tests__/__fixtures__/before.json', '__tests__/__fixtures__/after.json'))
    .toBe(`{
    host: hexlet.io
  + timeout: 20
  - timeout: 50
  - proxy: 123.234.53.22
  + verbose: true
}`);
});

test('gendiff step3 (yaml)', () => {
  expect(gendiff('__tests__/__fixtures__/before.yaml', '__tests__/__fixtures__/after.yaml'))
    .toBe(`{
    language: node_js
  + node_js: stable
  - node_js: last
  - script3: make start
  + script: make lint test
}`);
});
