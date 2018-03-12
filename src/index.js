import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import yaml from 'js-yaml';
import ini from 'ini';

const parseMethods = {
  '.json': {
    parse: JSON.parse,
  },
  '.yaml': {
    parse: yaml.safeLoad,
  },
  '.ini': {
    parse: ini.parse,
  },
};


const toStr = (key, before, after) => {
  if (!after[key]) {
    return `  - ${key}: ${before[key]}`;
  } else if (!before[key]) {
    return `  + ${key}: ${after[key]}`;
  } else if (before[key] !== after[key]) {
    return `  + ${key}: ${after[key]}\n  - ${key}: ${before[key]}`;
  }
  return `    ${key}: ${before[key]}`;
};

export default (fileBefore, fileAfter) => {
  const fileTypeBefore = path.extname(fileBefore);
  const fileTypeAfter = path.extname(fileAfter);
  const contentBefore = fs.readFileSync(fileBefore, 'utf8');
  const contentAfter = fs.readFileSync(fileAfter, 'utf8');
  // const parsedBefore = JSON.parse(contentBefore);
  // const parsedAfter = JSON.parse(contentAfter);
  const parsedBefore = parseMethods[fileTypeBefore].parse(contentBefore);
  const parsedAfter = parseMethods[fileTypeAfter].parse(contentAfter);
  const unitedKeys = _.union(Object.keys(parsedBefore), Object.keys(parsedAfter));
  return `{\n${unitedKeys.map(key => toStr(key, parsedBefore, parsedAfter)).join('\n')}\n}`;
};
