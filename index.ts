#!/usr/bin/env bun
import { Command } from 'commander';

const program = new Command();

program.name('drizzle-experimental-cli').description('Experimental CLI Tool for Drizzle').version('0.0.1');

program
  .command('hello <name>')
  .description('Say hello to someone')
  .action((name) => {
    console.log(`Hello, ${name}!`);
  });

program.parse();
