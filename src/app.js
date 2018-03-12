import program from 'commander';
import gendiff from './';

program
  .arguments('<firstConfig> <secondConfig>')
  .description('Compares two configuration files and shows a difference.')
  .option('-V, --version', 'output the version number')
  .option('-f, --format [type]', 'Output format')
  .action((firstConfig, secondConfig) => console.log(gendiff(firstConfig, secondConfig)));

export default () => program.parse(process.argv);
