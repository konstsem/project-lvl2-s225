import _ from 'lodash';

export default [
  {
    check: type => type === 'nested',
    renderNode: (node, breaks, renderAst, format, parentAsPrefix = '') =>
      `${renderAst(node.children, breaks, format, parentAsPrefix.concat(`${node.key}.`))}`,
  },
  {
    check: type => type === 'inserted',
    renderNode: (node, breaks, renderAst, format, parentAsPrefix = '') => {
      const valueAsPostfix = _.isObject(node.value) ? 'complex value' : `value: '${node.value}'`;
      return `Property '${parentAsPrefix}${node.key}' was added with ${valueAsPostfix}`;
    },
  },
  {
    check: type => type === 'deleted',
    renderNode: (node, breaks, renderAst, format, parentAsPrefix = '') =>
      `Property '${parentAsPrefix}${node.key}' was removed`,
  },
  {
    check: type => type === 'updated',
    renderNode: (node, breaks, renderAst, format, parentAsPrefix = '') => {
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
