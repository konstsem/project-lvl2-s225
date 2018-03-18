import _ from 'lodash';

const renderObj = (obj, level) => {
  const result = Object.keys(obj).map((key) => {
    const string = _.isObject(key) ?
      renderObj(key) : `${' '.repeat((level * 4) + 4)}${key}: ${obj[key]}`;
    return string;
  });
  return ['{', ...result, `${' '.repeat(level * 4)}}`].join('\n');
};

const renderers = {
  nested: (node, level, renderAst) =>
    `${' '.repeat((level * 4) + 4)}${node.key}: ${renderAst(node.children, level + 1)}`,
  unchanged: (node, level) => {
    const valueAsStr = (_.isPlainObject(node.value)) ?
      renderObj(node.value, level + 1) : node.value;
    return `${' '.repeat((level * 4) + 4)}${node.key}: ${valueAsStr}`;
  },
  inserted: (node, level) => {
    const valueAsStr = (_.isPlainObject(node.value)) ?
      renderObj(node.value, level + 1) : node.value;
    return `${' '.repeat((level * 4) + 2)}+ ${node.key}: ${valueAsStr}`;
  },
  deleted: (node, level) => {
    const valueAsStr = (_.isPlainObject(node.value)) ?
      renderObj(node.value, level + 1) : node.value;
    return `${' '.repeat((level * 4) + 2)}- ${node.key}: ${valueAsStr}`;
  },
  updated: (node, level) => {
    const valueBeforeAsStr = (_.isPlainObject(node.valueBefore)) ?
      renderObj(node.valueBefore, level + 1) : node.valueBefore;
    const valueAfterAsStr = (_.isPlainObject(node.valueAfter)) ?
      renderObj(node.valueAfter, level + 1) : node.valueAfter;
    return [`${' '.repeat((level * 4) + 2)}- ${node.key}: ${valueBeforeAsStr}`,
      `${' '.repeat((level * 4) + 2)}+ ${node.key}: ${valueAfterAsStr}`].join('\n');
  },
};

const defaultRenderer = (ast, level = 0) => {
  const astAsString = ast.map((node) => {
    const rendererNode = renderers[node.type];
    return rendererNode(node, level, defaultRenderer);
  });
  return ['{', ...astAsString, `${' '.repeat(level * 4)}}`].join('\n');
};

export default defaultRenderer;
