import defaultRenderer from './default';
import plainRenderer from './plain';
import jsonRenderer from './json';

export default {
  default: (ast, level, renderAst) =>
    defaultRenderer(ast, level, renderAst),
  plain: (ast, level, renderAst, parentAsPrefix) =>
    plainRenderer(ast, level, renderAst, parentAsPrefix),
  json: (ast, level, renderAst) =>
    jsonRenderer(ast, level, renderAst),
};
