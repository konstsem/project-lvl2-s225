import yaml from 'js-yaml';
import ini from 'ini';

export default {
  '.json': JSON.parse,
  '.yaml': yaml.safeLoad,
  '.ini': ini.parse,
};
