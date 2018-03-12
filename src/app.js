import program from 'commander';
import gendiff from './';

program
  .arguments('<firstConfig> <secondConfig>')
  .description('Compares two configuration files and shows a difference.')
  .option('-V, --version', 'output the version number')
  .option('-f, --format [type]', 'Output format')
  .action((file1, file2) => console.log(gendiff(file1, file2)));

export default () => program.parse(process.argv);
