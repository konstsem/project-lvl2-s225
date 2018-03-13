import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import yaml from 'js-yaml';
import ini from 'ini';
// import Node from './Node';

const parsers = {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.ini': ini.parse,
};

// const isObject = value => value instanceof Object;

const statuses = [
  // {
  //   status: 'hasChildren',
  //   check: (before, after) => isObject(before) && isObject(after),
  // },
  {
    status: 'inserted',
    check: (before, after) => !before && after,
    build: (valueBefore, valueAfter) => valueAfter,
  },
  {
    status: 'deleted',
    check: (before, after) => before && !after,
    build: valueBefore => valueBefore,
  },
  {
    status: 'changed',
    check: (before, after) => before !== after,
    build: (valueBefore, valueAfter) => ({
      before: valueBefore,
      after: valueAfter,
    }),
  },
  {
    status: 'unchanged',
    check: (before, after) => before === after,
    build: valueBefore => valueBefore,
  },
];

const renderers = [
  {
    status: 'inserted',
    render: node => `  + ${node.key}: ${node.value}`,
  },
  {
    status: 'deleted',
    render: node => `  - ${node.key}: ${node.value}`,
  },
  {
    status: 'changed',
    render: node =>
      `  + ${node.key}: ${node.value.after}\n  - ${node.key}: ${node.value.before}`,
  },
  {
    status: 'unchanged',
    render: node => `    ${node.key}: ${node.value}`,
  },

];
const buildAst = (keys, objectBefore, objectAfter) =>
  keys.map((key) => {
    const { status, build } = _.find(statuses, ({ check }) =>
      check(objectBefore[key], objectAfter[key]));
    const value = build(objectBefore[key], objectAfter[key]);
    return { key, status, value };
  });

const renderAst = ast => ast.map((node) => {
  const { render } = _.find(renderers, ({ status }) => status === node.status);
  return render(node);
}).join('\n');

export default (fileBefore, fileAfter) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  const parsedBefore = parsers[fileTypeBefore](contentBefore);
  const parsedAfter = parsers[fileTypeAfter](contentAfter);
  const unitedKeys = _.union(Object.keys(parsedBefore), Object.keys(parsedAfter));
  const ast = buildAst(unitedKeys, parsedBefore, parsedAfter);
  // console.log(ast);
  // console.log(parsedBefore);
  return `{\n${renderAst(ast)}\n}`;
};
