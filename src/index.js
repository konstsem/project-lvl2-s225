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

const renderObject = obj =>
  `{\n${Object.keys(obj).map(key => `${' '.repeat(8)}${key}: ${obj[key]}`)
    .join('\n')}\n${' '.repeat(4)}}`;

function Node(key) {
  this.key = key;

  this.render = function render() {
    return `${this.key}`;
  };
}
function Inserted(key, valueBefore = 'nothing', valueAfter) {
  Node.apply(this, [key]);
  this.before = valueBefore;
  this.after = valueAfter;
  this.prefix = '+ ';
  this.render = function render() {
    const value = this.after;
    const valueAsStr = (value instanceof Object && !(value instanceof Array)) ?
      renderObject(value) : value;
    return `${' '.repeat(2)}${this.prefix}${this.key}: ${valueAsStr}`;
  };
}
function Deleted(key, valueBefore, valueAfter = 'nothing') {
  Node.apply(this, [key]);
  this.before = valueBefore;
  this.after = valueAfter;
  this.prefix = '- ';
  this.render = function render() {
    const value = this.before;
    const valueAsStr = (value instanceof Object && !(value instanceof Array)) ?
      renderObject(value) : value;
    return `${' '.repeat(2)}${this.prefix}${this.key}: ${valueAsStr}`;
  };
}
function Changed(key, valueBefore, valueAfter) {
  Node.apply(this, [key]);
  this.before = valueBefore;
  this.after = valueAfter;
  this.prefixMinus = '- ';
  this.prefixPlus = '+ ';
  this.render = function render() {
    return [`${' '.repeat(2)}${this.prefixMinus}${this.key}: ${this.before}`,
      `${' '.repeat(2)}${this.prefixPlus}${this.key}: ${this.after}`].join('\n');
  };
}
function Unchanged(key, valueBefore, valueAfter) {
  Node.apply(this, [key]);
  this.before = valueBefore;
  this.after = valueAfter;
  this.prefix = '  ';
  this.render = function render() {
    return `${' '.repeat(2)}${this.prefix}${this.key}: ${this.before}`;
  };
}
function Nested(key) {
  Node.apply(this, [key]);
  this.prefix = '  ';
  this.render = function render() {
    return `${' '.repeat(2)}${this.prefix}${this.key}: test`;
  };
}

const isObject = value => value instanceof Object;

const typesOfNode = [
  {
    type: 'nested',
    check: (before, after) => isObject(before) && isObject(after) &&
      !(before instanceof Array && after instanceof Array),
    getBuilder: () => Nested,
  },
  {
    type: 'inserted',
    check: (before, after) => !before && after,
    getBuilder: () => Inserted,

  },
  {
    type: 'deleted',
    check: (before, after) => before && !after,
    getBuilder: () => Deleted,
  },
  {
    type: 'changed',
    check: (before, after) => before !== after,
    getBuilder: () => Changed,
  },
  {
    type: 'unchanged',
    check: (before, after) => before === after,
    getBuilder: () => Unchanged,
  },
];

const buildAst = (objectBefore, objectAfter) => {
  const unitedKeys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return unitedKeys.map((key) => {
    const nodeBefore = objectBefore[key];
    const nodeAfter = objectAfter[key];
    const { getBuilder } = _.find(typesOfNode, ({ check }) =>
      check(nodeBefore, nodeAfter));
    const Builder = getBuilder();
    return new Builder(key, nodeBefore, nodeAfter);
  });
};

const renderAst = (ast) => {
  const string = ast.map(node => node.render()).join('\n');
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
