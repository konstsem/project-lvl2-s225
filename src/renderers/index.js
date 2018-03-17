import _ from 'lodash';
import defaultRenderer from './default';
import plainRenderer from './plain';

export default {
  default: (ast, breaks, renderAst) => {
    const astAsString = ast.map((node) => {
      const { renderNode } = _.find(defaultRenderer, ({ check }) => check(node.type));
      return renderNode(node, breaks, renderAst);
    }).join('\n');
    return `{\n${astAsString}\n${' '.repeat(breaks - 2)}}`;
  },
  plain: (ast, breaks, renderAst, parentAsPrefix) => {
    const astAsString = ast.map((node) => {
      const { renderNode } = _.find(plainRenderer, ({ check }) => check(node.type));
      return renderNode(node, breaks, renderAst, 'plain', parentAsPrefix);
    }).filter(item => item);
    return astAsString.join('\n');
  },
};
