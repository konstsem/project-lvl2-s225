import fs from 'fs';
import gendiff from '../src';

test('gendiff step2 (json)', () => {
  expect(gendiff('__tests__/__fixtures__/before.json', '__tests__/__fixtures__/after.json'))
    .toBe(`{
    host: hexlet.io
  - timeout: 50
  + timeout: 20
  - proxy: 123.234.53.22
  + verbose: true
}`);
});

test('gendiff step3 (yaml)', () => {
  expect(gendiff('__tests__/__fixtures__/before.yaml', '__tests__/__fixtures__/after.yaml'))
    .toBe(`{
    language: node_js
  - node_js: last
  + node_js: stable
  - script3: make start
  + script: make lint test
}`);
});

test('gendiff step4 (ini)', () => {
  expect(gendiff('__tests__/__fixtures__/before.ini', '__tests__/__fixtures__/after.ini'))
    .toBe(`{
    scope: local
  - timeout: 50
  + timeout: 20
    proxy: 123.234.53.22
  + verbose: true
}`);
});

test('gendiff step5 (ast)', () => {
  expect(gendiff('__tests__/__fixtures__/before_tree.json', '__tests__/__fixtures__/after_tree.json'))
    .toBe(fs.readFileSync('__tests__/__fixtures__/diff_step5.out', 'utf8'));
});
