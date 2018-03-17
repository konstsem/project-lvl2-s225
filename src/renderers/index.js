import defaultRenderer from './default';
import plainRenderer from './plain';
import jsonRenderer from './json';

export default {
  default: () => defaultRenderer,
  plain: () => plainRenderer,
  json: () => jsonRenderer,
};
