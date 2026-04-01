#!/usr/bin/env node

import { showHelp } from './src/utils.js';
import { readConfig, showConfig, setConfig } from './src/config.js';
import {
  listEntries,
  addEntry,
  removeEntry,
  removeEntryInteractive,
  clearEntries,
  flushDNS,
  updateFromRemote
} from './src/commands.js';

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
    case 'ls':
      listEntries();
      break;
    case 'add':
      if (args.length < 3) {
        console.error('Usage: switch-host add <ip> <domain> [comment]');
        process.exit(1);
      }
      addEntry(args[1], args[2], args.slice(3).join(' '));
      break;
    case 'remove':
    case 'rm':
      if (args.length >= 2) {
        removeEntry(args[1]);
      } else {
        removeEntryInteractive();
      }
      break;
    case 'clear':
      clearEntries();
      break;
    case 'fetch':
      {
        const config = readConfig();
        updateFromRemote(args[1] || config.hostsUrl);
      }
      break;
    case 'config':
      if (args.length === 1) {
        showConfig();
      } else if (args.length === 2) {
        const config = readConfig();
        if (args[1] === 'hostsUrl') {
          console.log(config.hostsUrl);
        } else {
          console.error(`Unknown config key: ${args[1]}`);
          console.log('Available keys: hostsUrl');
          process.exit(1);
        }
      } else {
        setConfig(args[1], args[2]);
      }
      break;
    case 'flush':
      flushDNS();
      break;
    case 'help':
    case undefined:
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main();
