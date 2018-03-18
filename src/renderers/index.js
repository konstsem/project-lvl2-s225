import defaultRenderer from './default';
import plainRenderer from './plain';
import jsonRenderer from './json';

const renderers = {
  default: defaultRenderer,
  plain: plainRenderer,
  json: jsonRenderer,
};

export default (format) => {
  const renderer = renderers[format];
  if (!renderer) {
    throw new Error(`unkown output format ${format}`);
  }
  return renderer;
};
