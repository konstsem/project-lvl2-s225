import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import getRenderer from './renderers';
import getParser from './parsers';

const typesOfNode = [
  {
    type: 'nested',
    check: (before, after) => _.isPlainObject(before) && _.isPlainObject(after),
    buildNode: (key, type, before, after, func) =>
      ({ key, type: 'nested', children: func(before, after) }),
  },
  {
    type: 'inserted',
    check: (before, after) => !before && after,
    buildNode: (key, type, before, after) =>
      ({ key, type: 'inserted', value: after }),
  },
  {
    type: 'deleted',
    check: (before, after) => before && !after,
    buildNode: (key, type, before) =>
      ({ key, type: 'deleted', value: before }),
  },
  {
    type: 'updated',
    check: (before, after) => before !== after,
    buildNode: (key, type, before, after) =>
      ({
        key,
        type: 'updated',
        valueBefore: before,
        valueAfter: after,
      }),
    // ({
    //   key,
    //   type: 'updated',
    //   value: [{ key, type: 'deleted', value: before },
    //     { key, type: 'inserted', value: after }],
    // }),
  },
  {
    type: 'unchanged',
    check: (before, after) => before === after,
    buildNode: (key, type, before) =>
      ({ key, type: 'unchanged', value: before }),
  },
];

const buildAst = (objectBefore, objectAfter) => {
  const keys = _.union(Object.keys(objectBefore), Object.keys(objectAfter));
  return keys.map((key) => {
    const nodeBefore = objectBefore[key];
    const nodeAfter = objectAfter[key];
    const { type, buildNode } = _.find(typesOfNode, ({ check }) =>
      check(nodeBefore, nodeAfter));
    return buildNode(key, type, nodeBefore, nodeAfter, buildAst);
  });
};

const renderAst = (ast, format = 'default') => {
  const renderer = getRenderer(format);
  return renderer(ast);
};

export default (fileBefore, fileAfter, format) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  const parsedBefore = getParser(fileTypeBefore)(contentBefore);
  const parsedAfter = getParser(fileTypeAfter)(contentAfter);
  const ast = buildAst(parsedBefore, parsedAfter);
  return `${renderAst(ast, format)}\n`;
};
