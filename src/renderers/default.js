import _ from 'lodash';

const getPrefix = (type) => {
  if (type === 'inserted') {
    return '+ ';
  } else if (type === 'deleted') {
    return '- ';
  }
  return '  ';
};

const renderObj = (obj, breaks) => {
  const result = Object.keys(obj).map((key) => {
    const string = _.isObject(key) ?
      renderObj(key) : `${' '.repeat(breaks + 2)}${key}: ${obj[key]}`;
    return string;
  }).join('\n');
  return `{\n${result}\n${' '.repeat(breaks - 2)}}`;
};

export default [
  {
    check: type => type === 'nested',
    renderNode: (node, breaks, renderAst) =>
      `${' '.repeat(breaks)}${getPrefix(node.type)}${node.key}: ${renderAst(node.children, breaks + 4)}`,
  },
  {
    check: type => type === 'inserted' || type === 'deleted' || type === 'unchanged',
    renderNode: (node, breaks) => {
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, breaks + 4) : node.value;
      return `${' '.repeat(breaks)}${getPrefix(node.type)}${node.key}: ${valueAsStr}`;
    },
  },
  {
    check: type => type === 'updated',
    renderNode: (node, breaks) => {
      const beforeAsStr = (_.isObject(node.value.before) && !_.isArray(node.value.before)) ?
        renderObj(node.value.before, breaks + 4) : node.value.before;
      const afterAsStr = (_.isObject(node.value.after) && !_.isArray(node.value.after)) ?
        renderObj(node.value.after, breaks + 4) : node.value.after;
      return [`${' '.repeat(breaks)}${getPrefix('deleted')}${node.key}: ${beforeAsStr}`,
        `${' '.repeat(breaks)}${getPrefix('inserted')}${node.key}: ${afterAsStr}`].join('\n');
    },
  },
];
