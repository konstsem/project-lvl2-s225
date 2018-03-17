import _ from 'lodash';

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
      `${' '.repeat((level * 4) + 4)}${node.key}: ${renderAst(node.children, level + 1)}`,
  },
  {
    check: type => type === 'unchanged',
    renderNode: (node, level) => {
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, level + 1) : node.value;
      return `${' '.repeat((level * 4) + 4)}${node.key}: ${valueAsStr}`;
    },
  },
  {
    check: type => type === 'inserted',
    renderNode: (node, level) => {
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, level + 1) : node.value;
      return `${' '.repeat((level * 4) + 2)}+ ${node.key}: ${valueAsStr}`;
    },
  },
  {
    check: type => type === 'deleted',
    renderNode: (node, level) => {
      const valueAsStr = (_.isObject(node.value) && !_.isArray(node.value)) ?
        renderObj(node.value, level + 1) : node.value;
      return `${' '.repeat((level * 4) + 2)}- ${node.key}: ${valueAsStr}`;
    },
  },
  {
    check: type => type === 'updated',
    renderNode: (node, level) => {
      const valueBeforeAsStr = (_.isObject(node.valueBefore) && !_.isArray(node.valueBefore)) ?
        renderObj(node.valueBefore, level + 1) : node.valueBefore;
      const valueAfterAsStr = (_.isObject(node.valueAfter) && !_.isArray(node.valueAfter)) ?
        renderObj(node.valueAfter, level + 1) : node.valueAfter;
      return [`${' '.repeat((level * 4) + 2)}- ${node.key}: ${valueBeforeAsStr}`,
        `${' '.repeat((level * 4) + 2)}+ ${node.key}: ${valueAfterAsStr}`].join('\n');
    },
  },
];

const defaultRenderer = (ast, level = 0) => {
  const astAsString = ast.map((node) => {
    const { renderNode } = _.find(renderers, ({ check }) => check(node.type));
    return renderNode(node, level, defaultRenderer);
  });
  return ['{', ...astAsString, `${' '.repeat(level * 4)}}`].join('\n');
};

export default defaultRenderer;
