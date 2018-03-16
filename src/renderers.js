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

const defaultRenderers = [
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

export default {
  default: (ast, breaks, renderAst) => {
    const astAsString = ast.map((node) => {
      const { renderNode } = _.find(defaultRenderers, ({ check }) => check(node.type));
      return renderNode(node, breaks, renderAst);
    }).join('\n');
    return `{\n${astAsString}\n${' '.repeat(breaks - 2)}}`;
  },
  // plain: (ast, breaks, renderAst) => {
  // },
};

// renderers.default(node, breaks, renderAst)).join('\n');

// const renderers = [
//   {
//     type: () => 'nested',
//     buildStr: (node, breaks, func) =>
//       `${' '.repeat(breaks)}${' '.repeat(2)}${node.key}: ${func(node.children, breaks * 3)}`,
//   },
//   {
//     type: () => 'inserted',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}+ ${node.key}: ${_.isObject(node.value)}`,
//   },
//   {
//     type: () => 'deleted',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}- ${node.key}: ${node.value}`,
//   },
//   {
//     type: () => 'unchanged',
//     buildStr: (node, breaks) =>
//       `${' '.repeat(breaks)}${' '.repeat(2)}${node.key}: ${node.value}`,
//   },
// ];
