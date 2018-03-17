import _ from 'lodash';

const renderers = [
  {
    check: type => type === 'nested',
    renderNode: (node, renderAst) => renderAst(node.children, null, 'json'),
  },
  {
    check: type => type === 'inserted' || type === 'deleted' || type === 'unchanged',
    renderNode: node => JSON.stringify(node),
  },
  {
    check: type => type === 'updated',
    renderNode: node => JSON.stringify(node),
  },
];

export default (ast, level, renderAst) => ast.reduce((acc, node) => {
  const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
  const renderJson = renderNode(node, renderAst);
  return { ...acc, renderJson };
}, {});
