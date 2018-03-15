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

function Node(key, type, value = '') {
  this.key = key;
  this.type = type;
  this.value = value;
}

const typesOfNode = [
  {
    type: 'nested',
    check: (before, after) => isObject(before) && isObject(after) &&
      !(before instanceof Array && after instanceof Array),
    // getValue: () => '',
    // getChildren: (before, after, cons) => cons(before, after),
    buildNode: (key, type, before, after, func) => {
      const node = new Node(key, type);
      node.children = func(before, after);
      return node;
    },
  },
  {
    type: 'inserted',
    check: (before, after) => !before && after,
    // getValue: (before, after) => after,
    // getChildren: () => [],
    buildNode: (key, type, before, after) => new Node(key, type, after),
  },
  {
    type: 'deleted',
    check: (before, after) => before && !after,
    // getValue: before => before,
    // getChildren: () => [],
    buildNode: (key, type, before) => new Node(key, type, before),
  },
  {
    type: 'changed',
    check: (before, after) => before !== after,
    // getValue: () => '',
    // getChildren: () => [],
    buildNode: (key, type, before, after) =>
      [new Node(key, 'deleted', before), new Node(key, 'inserted', after)],
  },
  {
    type: 'unchanged',
    check: (before, after) => before === after,
    // getValue: before => before,
    // getChildren: () => [],
    buildNode: (key, type, before) => new Node(key, type, before),
  },
];

// const renderers = [
//   {
//     type: () => 'nested',
//     buildStr: (node, breaks, func) =>
//       `${' '.repeat(breaks)}${' '.repeat(2)}${node.key}: ${func(node.children, breaks * 3)}`,
//   },
//   {
//     type: () => 'inserted',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}+ ${node.key}: ${_.isObject(node.value)}`,
//   },
//   {
//     type: () => 'deleted',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}- ${node.key}: ${node.value}`,
//   },
//   {
//     type: () => 'unchanged',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}${' '.repeat(2)}${node.key}: ${node.value}`,
//   },
// ];

const buildAst = (objectBefore, objectAfter) => {
  const unitedKeys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return _.flatten(unitedKeys.map((key) => {
    const nodeBefore = objectBefore[key];
    const nodeAfter = objectAfter[key];
    const { type, buildNode } = _.find(typesOfNode, ({ check }) =>
      check(nodeBefore, nodeAfter));
    const node = buildNode(key, type, nodeBefore, nodeAfter, buildAst);
    return node;
    // const children = getChildren(nodeBefore, nodeAfter, buildAst);
    // if (type === 'changed') {
    //   return [{ key, value: nodeBefore, children }, { key, value: nodeAfter, children }];
    // }
    // const value = getValue(nodeBefore, nodeAfter);
    // return { key, value, children };
  }));
};

const getPrefix = (type) => {
  if (type === 'inserted') {
    return '+ ';
  } else if (type === 'deleted') {
    return '- ';
  }
  return '  ';
};

const renderObj = (obj, breaks) => {
  const result = Object.keys(obj).map((key) => {
    const string = _.isObject(key) ?
      renderObj(key) : `${' '.repeat(breaks + 2)}${key}: ${obj[key]}`;
    return string;
  }).join('\n');
  return `{\n${result}\n${' '.repeat(breaks - 2)}}`;
};

const renderAst = (ast, breaks) => {
  const astAsString = ast.map((node) => {
    const prefix = getPrefix(node.type);
    if (node.children) {
      return `${' '.repeat(breaks)}${prefix}${node.key}: ${renderAst(node.children, breaks + 4)}`;
    }
    const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
      renderObj(node.value, breaks + 4) : node.value;
    return `${' '.repeat(breaks)}${prefix}${node.key}: ${valueAsStr}`;
    // const { buildStr } = _.find(renderers, ({ type }) => type() === node.type);
    // return buildStr(node, breaks, renderAst);
  }).join('\n');
  // const string = ast.map((node) => {
  //   const value = (node.value) ? node.value : renderAst(node.children);
  //   return `${' '.repeat(4)}${node.key}: ${value}`;
  // }).join('\n');
  return `{\n${astAsString}\n${' '.repeat(breaks - 2)}}`;
};

export default (fileBefore, fileAfter) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  const parsedBefore = parsers[fileTypeBefore](contentBefore);
  const parsedAfter = parsers[fileTypeAfter](contentAfter);
  const ast = buildAst(parsedBefore, parsedAfter);
  // console.log(ast);
  return `${renderAst(ast, 2)}\n`;
};
