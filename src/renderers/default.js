import _ from 'lodash';

const renderObj = (obj, level) => {
  const result = Object.keys(obj).map((key) => {
    const string = _.isObject(key) ?
      renderObj(key) : `${' '.repeat((level * 4) + 4)}${key}: ${obj[key]}`;
    return string;
  });
  return ['{', ...result, `${' '.repeat(level * 4)}}`].join('\n');
};

const getValueAsStr = (value, level) =>
  ((_.isPlainObject(value)) ? renderObj(value, level + 1) : value);

const getOut = (prefix, key, value) => `${prefix}${key}: ${value}`;

const renderers = {
  nested: (node, level, renderAst) => {
    const prefix = ' '.repeat((level * 4) + 4);
    const value = renderAst(node.children, level + 1);
    return getOut(prefix, node.key, value);
  },
  unchanged: (node, level) => {
    const prefix = ' '.repeat((level * 4) + 4);
    const value = getValueAsStr(node.value, level);
    return getOut(prefix, node.key, value);
  },
  inserted: (node, level) => {
    const prefix = `${' '.repeat((level * 4) + 2)}+ `;
    const value = getValueAsStr(node.value, level);
    return getOut(prefix, node.key, value);
  },
  deleted: (node, level) => {
    const prefix = `${' '.repeat((level * 4) + 2)}- `;
    const value = getValueAsStr(node.value, level);
    return getOut(prefix, node.key, value);
  },
  updated: (node, level) => {
    const valueBeforeAsStr = getValueAsStr(node.valueBefore, level);
    const valueAfterAsStr = getValueAsStr(node.valueAfter, level);
    return [getOut(`${' '.repeat((level * 4) + 2)}- `, node.key, valueBeforeAsStr),
      getOut(`${' '.repeat((level * 4) + 2)}+ `, node.key, valueAfterAsStr)].join('\n');
  },
};

const getDefaultRenderer = (ast, level = 0) => {
  const astAsString = ast.map((node) => {
    const rendererNode = renderers[node.type];
    return rendererNode(node, level, getDefaultRenderer);
  });
  return ['{', ...astAsString, `${' '.repeat(level * 4)}}`].join('\n');
};

export default getDefaultRenderer;
