import fs from 'fs';
import { HOSTS_PATH, MARKER_START, MARKER_END } from './utils.js';

export function readHostsFile() {
  try {
    return fs.readFileSync(HOSTS_PATH, 'utf-8');
  } catch (error) {
    console.error(`Error reading hosts file: ${error.message}`);
    process.exit(1);
  }
}

export function writeHostsFile(content) {
  try {
    fs.writeFileSync(HOSTS_PATH, content, 'utf-8');
    console.log('Hosts file updated successfully.');
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      console.error('Error: Permission denied. Please run as administrator.');
    } else {
      console.error(`Error writing hosts file: ${error.message}`);
    }
    process.exit(1);
  }
}

export function getManagedSection(content) {
  const startIndex = content.indexOf(MARKER_START);
  const endIndex = content.indexOf(MARKER_END);
  
  if (startIndex === -1 || endIndex === -1) {
    return { exists: false, entries: [], before: content, after: '' };
  }
  
  const before = content.substring(0, startIndex).trimEnd();
  const after = content.substring(endIndex + MARKER_END.length).trimStart();
  const section = content.substring(startIndex, endIndex + MARKER_END.length);
  
  const lines = section.split('\n').slice(1, -1);
  const entries = lines
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => {
      const parts = line.trim().split(/\s+/);
      const ip = parts[0];
      const domain = parts[1] || '';
      const comment = parts.slice(2).join(' ');
      return { ip, domain, comment };
    });
  
  return { exists: true, entries, before, after };
}

export function parseAllEntries(content) {
  const lines = content.split('\n');
  const entries = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        entries.push({
          ip: parts[0],
          domain: parts[1],
          comment: parts.slice(2).join(' '),
          lineNumber: index + 1
        });
      }
    }
  });
  
  return entries;
}
