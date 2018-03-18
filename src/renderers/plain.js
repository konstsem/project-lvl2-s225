import _ from 'lodash';

const renderers = {
  nested: (node, parentAsPrefix = '', plainRenderer) =>
    `${plainRenderer(node.children, parentAsPrefix.concat(`${node.key}.`))}`,
  inserted: (node, parentAsPrefix = '') => {
    const valueAsPostfix = _.isObject(node.value) ? 'complex value' : `value: '${node.value}'`;
    return `Property '${parentAsPrefix}${node.key}' was added with ${valueAsPostfix}`;
  },
  deleted: (node, parentAsPrefix = '') =>
    `Property '${parentAsPrefix}${node.key}' was removed`,
  updated: (node, parentAsPrefix = '') => {
    const valueBeforeAsStr = _.isObject(node.valueBefore) ? 'complex value' : `'${node.valueBefore}'`;
    const valueAfterAsStr = _.isObject(node.valueAfter) ? 'complex value' : `'${node.valueAfter}'`;
    return `Property '${parentAsPrefix}${node.key}' was updated. From ${valueBeforeAsStr} to ${valueAfterAsStr}`;
  },
  unchanged: () => 'unchanged',
};

const plainRenderer = (ast, parentAsPrefix) => {
  const astAsString = ast.map((node) => {
    const rendererNode = renderers[node.type];
    return rendererNode(node, parentAsPrefix, plainRenderer);
  });
  return astAsString.filter(item => item !== 'unchanged').join('\n');
};

export default plainRenderer;
