import _ from 'lodash';

const renderers = [
  {
    check: type => type === 'nested',
    renderNode: (node, level, renderAst, format, parentAsPrefix = '') =>
      `${renderAst(node.children, level, format, parentAsPrefix.concat(`${node.key}.`))}`,
  },
  {
    check: type => type === 'inserted',
    renderNode: (node, level, renderAst, format, parentAsPrefix = '') => {
      const valueAsPostfix = _.isObject(node.value) ? 'complex value' : `value: '${node.value}'`;
      return `Property '${parentAsPrefix}${node.key}' was added with ${valueAsPostfix}`;
    },
  },
  {
    check: type => type === 'deleted',
    renderNode: (node, level, renderAst, format, parentAsPrefix = '') =>
      `Property '${parentAsPrefix}${node.key}' was removed`,
  },
  {
    check: type => type === 'updated',
    renderNode: (node, level, renderAst, format, parentAsPrefix = '') => {
      const valueBeforeAsStr = _.isObject(node.value.before) ? 'complex value' : `'${node.value.before}'`;
      const valueAfterAsStr = _.isObject(node.value.after) ? 'complex value' : `'${node.value.after}'`;
      return `Property '${parentAsPrefix}${node.key}' was updated. From ${valueBeforeAsStr} to ${valueAfterAsStr}`;
    },
  },
  {
    check: type => type === 'unchanged',
    renderNode: () => null,
  },
];

export default (ast, level, renderAst, format, parentAsPrefix) => {
  const astAsString = ast.map((node) => {
    const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
    return renderNode(node, level, renderAst, 'plain', parentAsPrefix);
  });
  return astAsString.join('\n');
};
