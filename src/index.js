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

const isObject = value => value instanceof Object;

const statuses = [
  {
    status: 'hasChildren',
    check: (before, after) => isObject(before) && isObject(after) &&
      !(before instanceof Array && after instanceof Array),
  },
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
  // {
  //   status: 'hasChildren',
  //   render: (node, func) => `    ${node.key}: ${func(node.children)}`,
  // },
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

const buildAst = (objectBefore, objectAfter) => {
  const unitedKeys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return unitedKeys.map((key) => {
    const { status, build } = _.find(statuses, ({ check }) =>
      check(objectBefore[key], objectAfter[key]));
    if (status === 'hasChildren') {
      const children = buildAst(objectBefore[key], objectAfter[key]);
      return { key, status, children };
    }
    const value = build(objectBefore[key], objectAfter[key]);
    return { key, status, value };
  });
};

const renderAst = (ast) => {
  const string = ast.map((node) => {
    const { render } = _.find(renderers, ({ status }) => status === node.status);
    return render(node);
  }).join('\n');
  return `{\n${string}\n}`;
};

export default (fileBefore, fileAfter) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  const parsedBefore = parsers[fileTypeBefore](contentBefore);
  const parsedAfter = parsers[fileTypeAfter](contentAfter);
  const ast = buildAst(parsedBefore, parsedAfter);
  return renderAst(ast);
};
