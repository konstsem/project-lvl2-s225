import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import yaml from 'js-yaml';
import ini from 'ini';

const parsers = {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.ini': ini.parse,
};

const isObject = value => value instanceof Object;

const typesOfNode = [
  {
    type: 'nested',
    check: (before, after) => isObject(before) && isObject(after) &&
      !(before instanceof Array && after instanceof Array),
    getValue: () => '',
    getChildren: (before, after, cons) => cons(before, after),
  },
  {
    type: 'inserted',
    check: (before, after) => !before && after,
    getValue: (before, after) => after,
    getChildren: () => [],
  },
  {
    type: 'deleted',
    check: (before, after) => before && !after,
    getValue: before => before,
    getChildren: () => [],
  },
  {
    type: 'changed',
    check: (before, after) => before !== after,
    getValue: () => '',
    getChildren: () => [],
  },
  {
    type: 'unchanged',
    check: (before, after) => before === after,
    getValue: before => before,
    getChildren: () => [],
  },
];

const buildAst = (objectBefore, objectAfter) => {
  const unitedKeys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return _.flatten(unitedKeys.map((key) => {
    const nodeBefore = objectBefore[key];
    const nodeAfter = objectAfter[key];
    const { type, getValue, getChildren } = _.find(typesOfNode, ({ check }) =>
      check(nodeBefore, nodeAfter));
    const children = getChildren(nodeBefore, nodeAfter, buildAst);
    if (type === 'changed') {
      return [{ key, value: nodeBefore, children }, { key, value: nodeAfter, children }];
    }
    const value = getValue(nodeBefore, nodeAfter);
    return { key, value, children };
  }));
};

const renderAst = (ast) => {
  const string = ast.map((node) => {
    const value = (node.value) ? node.value : renderAst(node.children);
    return `${' '.repeat(4)}${node.key}: ${value}`;
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
  console.log(ast);
  return renderAst(ast);
};
