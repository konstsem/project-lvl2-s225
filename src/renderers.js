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

export default {
  default: (ast, breaks, renderAst) => {
    const astAsString = ast.map((node) => {
      const prefix = getPrefix(node.type);
      if (node.type === 'nested') {
        return `${' '.repeat(breaks)}${prefix}${node.key}: ${renderAst(node.children, breaks + 4)}`;
      }
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, breaks + 4) : node.value;
      return `${' '.repeat(breaks)}${prefix}${node.key}: ${valueAsStr}`;
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
