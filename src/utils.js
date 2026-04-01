import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const HOSTS_PATH = process.platform === 'win32' 
  ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
  : '/etc/hosts';

export const MARKER_START = '# === switch-host start ===';
export const MARKER_END = '# === switch-host end ===';
export const DEFAULT_HOSTS_URL = 'https://raw.hellogithub.com/hosts.json';
export const CONFIG_PATH = path.join(path.dirname(__dirname), '.switch-host-config.json');

export const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m'
};

export function showHelp() {
  console.log(`
Usage: switch-host <command> [options]

Commands:
  list, ls        List all hosts entries
  add             Add a new host entry
                  Usage: switch-host add <ip> <domain> [comment]
  remove, rm      Remove host entry(ies)
                  Usage: switch-host remove [domain]
                  Without domain: interactive selection with numbered list
  clear           Clear all fetched entries (from fetch command)
  fetch           Fetch hosts from remote URL and update
                  Usage: switch-host fetch [url]
                  Uses configured URL if not specified
  config          View or set configuration
                  Usage: switch-host config [key] [value]
                  switch-host config              - show current config
                  switch-host config hostsUrl     - show hostsUrl value
                  switch-host config hostsUrl <url> - set hostsUrl
  flush           Flush DNS cache
  help            Show this help message

Examples:
  switch-host add 127.0.0.1 example.local "local dev"
  switch-host remove example.local
  switch-host remove
  switch-host list
  switch-host fetch
  switch-host config hostsUrl https://example.com/hosts.json
  switch-host flush
`);
}
