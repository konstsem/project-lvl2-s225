import fs from 'fs';
import _ from 'lodash';

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
  const contentBefore = fs.readFileSync(fileBefore);
  const contentAfter = fs.readFileSync(fileAfter);
  const parsedBefore = JSON.parse(contentBefore);
  const parsedAfter = JSON.parse(contentAfter);
  const unitedKeys = _.union(Object.keys(parsedBefore), Object.keys(parsedAfter));
  return `{\n${unitedKeys.map(key => toStr(key, parsedBefore, parsedAfter)).join('\n')}\n}`;
};
