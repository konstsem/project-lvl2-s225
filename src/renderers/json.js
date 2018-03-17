import _ from 'lodash';

const renderers = [
  {
    check: type => type === 'nested',
    renderNode: (node, renderAst) => renderAst(node.children, null, 'json'),
  },
  {
    check: type => type === 'inserted' || type === 'deleted' || type === 'unchanged',
    renderNode: node => ({ [node.key]: node.value, type: node.type }),
  },
  {
    check: type => type === 'updated',
    renderNode: node => ({ [node.key]: [], type: node.type }),
  },
];

export default (ast, level, renderAst) =>
  ast.map((node) => {
    const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
    return renderNode(node, renderAst);
  });
// ast.reduce((acc, node) => {
//   const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
//   const renderJson = renderNode(node, renderAst);
//   return { ...acc, renderJson };
// }, {});
