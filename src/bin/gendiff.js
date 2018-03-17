#!/usr/bin/env node
import program from 'commander';
import gendiff from '../';

program
  .version('0.0.10', '-V, --version')
  .arguments('<firstConfig> <secondConfig>')
  .description('Compares two configuration files and shows a difference.')
  // .option('-V, --version', 'output the version number')
  .option('-f, --format [type]', 'Output format')
  .action((firstConfig, secondConfig) => {
    const format = program.format || 'default';
    console.log(gendiff(firstConfig, secondConfig, format));
  })
  .parse(process.argv);
