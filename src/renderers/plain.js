import _ from 'lodash';

const renderers = [
  {
    check: type => type === 'nested',
    renderNode: (node, parentAsPrefix = '', plainRenderer) =>
      `${plainRenderer(node.children, parentAsPrefix.concat(`${node.key}.`))}`,
  },
  {
    check: type => type === 'inserted',
    renderNode: (node, parentAsPrefix = '') => {
      const valueAsPostfix = _.isObject(node.value) ? 'complex value' : `value: '${node.value}'`;
      return `Property '${parentAsPrefix}${node.key}' was added with ${valueAsPostfix}`;
    },
  },
  {
    check: type => type === 'deleted',
    renderNode: (node, parentAsPrefix = '') =>
      `Property '${parentAsPrefix}${node.key}' was removed`,
  },
  {
    check: type => type === 'updated',
    renderNode: (node, parentAsPrefix = '') => {
      const valueBeforeAsStr = _.isObject(node.valueBefore) ? 'complex value' : `'${node.valueBefore}'`;
      const valueAfterAsStr = _.isObject(node.valueAfter) ? 'complex value' : `'${node.valueAfter}'`;
      return `Property '${parentAsPrefix}${node.key}' was updated. From ${valueBeforeAsStr} to ${valueAfterAsStr}`;
    },
  },
  {
    check: type => type === 'unchanged',
    renderNode: () => 'unchanged',
  },
];

const plainRenderer = (ast, parentAsPrefix) => {
  const astAsString = ast.map((node) => {
    const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
    return renderNode(node, parentAsPrefix, plainRenderer);
  });
  return astAsString.filter(item => item !== 'unchanged').join('\n');
};

export default plainRenderer;
