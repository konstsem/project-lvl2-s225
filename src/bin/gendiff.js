#!/usr/bin/env node
import program from 'commander';
import gendiff from '../';

program
  .version('0.0.14', '-V, --version')
  .arguments('<firstConfig> <secondConfig>')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'Output format')
  .action((firstConfig, secondConfig) => {
    console.log(gendiff(firstConfig, secondConfig, program.format));
  })
  .parse(process.argv);
