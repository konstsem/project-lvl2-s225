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
    .toBe(`{
    common: {
        setting1: Value 1
      - setting2: 200
      - setting3: true
      + setting3: {
            key: value
        }
        setting6: {
            key: value
          + ops: vops
        }
      + setting4: blah blah
      + setting5: {
            key5: value5
        }
    }
    group1: {
      + baz: bars
      - baz: bas
        foo: bar
      - nest: {
            key: value
        }
      + nest: str
    }
  - group2: {
        abc: 12345
    }
  + group3: {
        fee: 100500
    }
}`);
});
