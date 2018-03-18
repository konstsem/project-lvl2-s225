export default ast => JSON.stringify(ast, null, ' ');

// import _ from 'lodash';
//
// const renderers = [
//   {
//     check: type => type === 'nested',
//     renderNode: (node, renderAst) => renderAst(node.children, null, 'json'),
//   },
//   {
//     check: type => type === 'inserted' || type === 'deleted' || type === 'unchanged',
//     // renderNode: node => ({ [node.key]: node.value, type: node.type }),
//     renderNode: node => `{"${node.key}": "${node.value}", "type": "${node.type}"}`,
//   },
//   {
//     check: type => type === 'updated',
//     // renderNode: node => ({ [node.key]: [], type: node.type }),
//     renderNode: node =>
//       `{"${node.key}": {"before": "${node.valueBefore}",
// "after": "${node.valueAfter}"}, "type": "${node.type}"}`,
//   },
// ];

// ast.map((node) => {
//   const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
//   return renderNode(node, jsonRender);
// });

// export default jsonRender;
// ast.reduce((acc, node) => {
//   const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
//   const renderJson = renderNode(node, renderAst);
//   return { ...acc, renderJson };
// }, {});
