import _ from 'lodash';

const getPrefix = (type) => {
  if (type === 'inserted') {
    return '+ ';
  } else if (type === 'deleted') {
    return '- ';
  }
  return '  ';
};

const renderObj = (obj, level) => {
  const result = Object.keys(obj).map((key) => {
    const string = _.isObject(key) ?
      renderObj(key) : `${' '.repeat((level * 4) + 4)}${key}: ${obj[key]}`;
    return string;
  });
  return ['{', ...result, `${' '.repeat(level * 4)}}`].join('\n');
};

const renderers = [
  {
    check: type => type === 'nested',
    renderNode: (node, level, renderAst) =>
      `${' '.repeat((level * 4) + 2)}${getPrefix(node.type)}${node.key}: ${renderAst(node.children, level + 1)}`,
  },
  {
    check: type => type === 'inserted' || type === 'deleted' || type === 'unchanged',
    renderNode: (node, level) => {
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, level + 1) : node.value;
      return `${' '.repeat((level * 4) + 2)}${getPrefix(node.type)}${node.key}: ${valueAsStr}`;
    },
  },
  {
    check: type => type === 'updated',
    renderNode: (node, level, renderAst) => {
      const nodeAsStr = node.value.map((item) => {
        const { renderNode } = _.find(renderers, ({ check }) => check(item.type));
        return renderNode(item, level, renderAst, 'default');
      });
      return nodeAsStr.join('\n');
    },
    // renderAst(node.value, level),
  },
];

const defaultRenderer = (ast, level, renderAst) => {
  const astAsString = ast.map((node) => {
    const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
    return renderNode(node, level, renderAst, 'default');
  });
  return ['{', ...astAsString, `${' '.repeat(level * 4)}}`].join('\n');
};

export default defaultRenderer;
