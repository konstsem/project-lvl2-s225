import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import yaml from 'js-yaml';
import ini from 'ini';
import renderers from './renderers';

const parsers = {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.ini': ini.parse,
};

// const isObject = value => value instanceof Object;

function Node(key, type, value = '', children = []) {
  this.key = key;
  this.type = type;
  this.value = value;
  this.children = children;
}

const typesOfNode = [
  {
    type: 'nested',
    check: (before, after) => _.isObject(before) && _.isObject(after) &&
      !(before instanceof Array && after instanceof Array),
    buildNode: (key, type, before, after, func) => {
      const node = new Node(key, type, '', func(before, after));
      return node;
    },
  },
  {
    type: 'inserted',
    check: (before, after) => !before && after,
    buildNode: (key, type, before, after) => new Node(key, type, after),
  },
  {
    type: 'deleted',
    check: (before, after) => before && !after,
    buildNode: (key, type, before) => new Node(key, type, before),
  },
  {
    type: 'changed',
    check: (before, after) => before !== after,
    buildNode: (key, type, before, after) =>
      [new Node(key, 'deleted', before), new Node(key, 'inserted', after)],
  },
  {
    type: 'unchanged',
    check: (before, after) => before === after,
    buildNode: (key, type, before) => new Node(key, type, before),
  },
];

const buildAst = (objectBefore, objectAfter) => {
  const keys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return _.flatten(keys.map((key) => {
    const nodeBefore = objectBefore[key];
    const nodeAfter = objectAfter[key];
    const { type, buildNode } = _.find(typesOfNode, ({ check }) =>
      check(nodeBefore, nodeAfter));
    const node = buildNode(key, type, nodeBefore, nodeAfter, buildAst);
    return node;
  }));
};

const renderAst = (ast, breaks, format = 'default') =>
  renderers[format](ast, breaks, renderAst);

export default (fileBefore, fileAfter) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  const parsedBefore = parsers[fileTypeBefore](contentBefore);
  const parsedAfter = parsers[fileTypeAfter](contentAfter);
  const ast = buildAst(parsedBefore, parsedAfter);
  const format = 'default';
  return `${renderAst(ast, 2, format)}\n`;
};
