import https from 'https';
import { execSync } from 'child_process';
import { colors, MARKER_START, MARKER_END } from './utils.js';
import { readHostsFile, writeHostsFile, getManagedSection, parseAllEntries } from './hosts.js';

export function listEntries() {
  const content = readHostsFile();
  const { entries: managedEntries } = getManagedSection(content);
  const allEntries = parseAllEntries(content);
  
  const managedSet = new Set(managedEntries.map(e => e.domain));
  const managedList = [];
  const externalList = [];
  
  allEntries.forEach(entry => {
    if (managedSet.has(entry.domain)) {
      managedList.push(entry);
    } else {
      externalList.push(entry);
    }
  });
  
  console.log(`\n=== Hosts List ===\n`);
  
  if (managedList.length > 0) {
    console.log(`Fetched entries (${managedList.length}):`);
    console.log(`IP\t\t\tDomain`);
    console.log(`${'-'.repeat(50)}`);
    managedList.forEach(({ ip, domain }) => {
      console.log(`${ip}\t\t${domain}`);
    });
    console.log();
  }
  
  if (externalList.length > 0) {
    console.log(`Other entries (${externalList.length}):`);
    console.log(`IP\t\t\tDomain`);
    console.log(`${'-'.repeat(50)}`);
    externalList.forEach(({ ip, domain }) => {
      console.log(`${ip}\t\t${domain}`);
    });
    console.log();
  }
  
  console.log(`Total: ${allEntries.length} entries (${managedList.length} fetched, ${externalList.length} other)`);
}

export function addEntry(ip, domain, comment = '') {
  const content = readHostsFile();
  const newEntry = `${ip}\t${domain}${comment ? '\t' + comment : ''}`;
  const newContent = `${content.trimEnd()}\n${newEntry}\n`;
  writeHostsFile(newContent);
  console.log(`Added new entry: ${ip} ${domain}`);
}

export function removeEntry(domain) {
  const content = readHostsFile();
  const allEntries = parseAllEntries(content);
  
  const matches = allEntries.filter(e => 
    e.domain.toLowerCase().includes(domain.toLowerCase())
  );
  
  if (matches.length === 0) {
    console.log(`No matching entry found for "${domain}".`);
    return;
  }
  
  const { entries: managedEntries } = getManagedSection(content);
  const managedSet = new Set(managedEntries.map(e => e.domain));
  
  console.log(`\n${colors.cyan}=== Matching Entries ===${colors.reset}\n`);
  
  matches.forEach((entry, index) => {
    const isManaged = managedSet.has(entry.domain);
    const color = isManaged ? colors.green : colors.gray;
    console.log(`${color}  ${index + 1}. ${entry.ip}\t${entry.domain}${colors.reset}`);
  });
  
  console.log(`\n${colors.yellow}Found ${matches.length} matching entry(ies).${colors.reset}`);
  console.log(`${colors.gray}Remove all? (y/n): ${colors.reset}`);
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  const cleanup = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
  };
  
  process.stdin.on('data', (key) => {
    const char = key.toString().toLowerCase();
    
    if (char === '\u0003') {
      cleanup();
      console.log('\nCancelled.');
      return;
    }
    
    if (char === 'y') {
      cleanup();
      console.log('y');
      
      const toRemove = new Set(matches.map(e => e.domain));
      const lines = content.split('\n');
      const newLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2 && toRemove.has(parts[1])) {
            return false;
          }
        }
        return true;
      });
      
      writeHostsFile(newLines.join('\n'));
      console.log(`Removed ${matches.length} entry(ies).`);
      return;
    }
    
    if (char === 'n' || char === '\u001b' || char === '\r' || char === '\n') {
      cleanup();
      console.log('n');
      console.log('Cancelled.');
      return;
    }
  });
}

export function removeEntryInteractive() {
  const content = readHostsFile();
  const { entries: managedEntries } = getManagedSection(content);
  const allEntries = parseAllEntries(content);
  
  if (allEntries.length === 0) {
    console.log('No entries found.');
    return;
  }
  
  const managedSet = new Set(managedEntries.map(e => e.domain));
  const managedList = [];
  const externalList = [];
  
  allEntries.forEach(entry => {
    if (managedSet.has(entry.domain)) {
      managedList.push(entry);
    } else {
      externalList.push(entry);
    }
  });
  
  console.log(`\n${colors.cyan}=== Remove Entry ===${colors.reset}\n`);
  
  let index = 1;
  
  if (managedList.length > 0) {
    console.log(`${colors.green}Fetched entries (${managedList.length}):${colors.reset}`);
    console.log(`${colors.green}No.\tIP\t\t\tDomain${colors.reset}`);
    console.log(`${colors.green}${'-'.repeat(50)}${colors.reset}`);
    managedList.forEach(({ ip, domain }) => {
      console.log(`${colors.green}${String(index++).padStart(2)}\t${ip}\t\t${domain}${colors.reset}`);
    });
    console.log();
  }
  
  if (externalList.length > 0) {
    console.log(`${colors.gray}Other entries (${externalList.length}):${colors.reset}`);
    console.log(`${colors.gray}No.\tIP\t\t\tDomain${colors.reset}`);
    console.log(`${colors.gray}${'-'.repeat(50)}${colors.reset}`);
    externalList.forEach(({ ip, domain }) => {
      console.log(`${colors.gray}${String(index++).padStart(2)}\t${ip}\t\t${domain}${colors.reset}`);
    });
    console.log();
  }
  
  console.log(`${colors.gray}Enter number(s) to remove, multiple numbers separated by space${colors.reset}`);
  console.log(`${colors.gray}Press Enter or Esc to cancel${colors.reset}\n`);
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  let input = '';
  
  const cleanup = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
  };
  
  process.stdout.write('Remove: ');
  
  process.stdin.on('data', (key) => {
    const char = key.toString();
    
    if (char === '\u001b' || char === '\u0003') {
      cleanup();
      console.log('\nCancelled.');
      return;
    }
    
    if (char === '\r' || char === '\n') {
      cleanup();
      console.log();
      
      if (!input.trim()) {
        console.log('Cancelled.');
        return;
      }
      
      const indices = input.trim().split(/\s+/).map(n => parseInt(n) - 1);
      const validIndices = indices.filter(i => i >= 0 && i < allEntries.length);
      
      if (validIndices.length === 0) {
        console.log('Invalid selection.');
        return;
      }
      
      const toRemove = new Set(validIndices.map(i => allEntries[i].domain));
      const lines = content.split('\n');
      const newLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2 && toRemove.has(parts[1])) {
            return false;
          }
        }
        return true;
      });
      
      writeHostsFile(newLines.join('\n'));
      console.log(`Removed ${validIndices.length} entry(ies).`);
      return;
    }
    
    if (char === '\u007f' || char === '\b') {
      if (input.length > 0) {
        input = input.slice(0, -1);
        process.stdout.write('\b \b');
      }
      return;
    }
    
    if (/[\d\s]/.test(char)) {
      input += char;
      process.stdout.write(char);
    }
  });
}

export function clearEntries() {
  const content = readHostsFile();
  const { exists, before, after } = getManagedSection(content);
  
  if (!exists) {
    console.log('No fetched entries found.');
    return;
  }
  
  const newContent = `${before}\n${after}`;
  writeHostsFile(newContent.trim() + '\n');
  console.log('All fetched entries cleared.');
}

export function flushDNS() {
  try {
    if (process.platform === 'win32') {
      execSync('ipconfig /flushdns', { encoding: 'buffer' });
      console.log('DNS cache flushed successfully.');
    } else if (process.platform === 'darwin') {
      execSync('sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder', { stdio: 'inherit' });
      console.log('DNS cache flushed successfully.');
    } else {
      execSync('sudo systemd-resolve --flush-caches', { stdio: 'inherit' });
      console.log('DNS cache flushed successfully.');
    }
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') {
      console.error('Error: Permission denied. Please run as administrator.');
    } else {
      console.error(`Error flushing DNS: ${error.message}`);
    }
    process.exit(1);
  }
}

function fetchRemoteHosts(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching hosts from: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch: ${error.message}`));
    });
  });
}

export function updateFromRemote(url) {
  fetchRemoteHosts(url)
    .then((data) => {
      if (!data || typeof data !== 'object') {
        console.error('Invalid data format received');
        process.exit(1);
      }
      
      const newEntries = [];
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (Array.isArray(item) && item.length >= 2) {
            newEntries.push({ ip: item[0], domain: item[1], comment: item[2] || '' });
          } else if (item.ip && item.host) {
            newEntries.push({ ip: item.ip, domain: item.host, comment: item.comment || '' });
          }
        });
      } else if (data.hosts && Array.isArray(data.hosts)) {
        data.hosts.forEach(item => {
          if (Array.isArray(item) && item.length >= 2) {
            newEntries.push({ ip: item[0], domain: item[1], comment: item[2] || '' });
          } else if (item.ip && item.host) {
            newEntries.push({ ip: item.ip, domain: item.host, comment: item.comment || '' });
          }
        });
      } else {
        Object.entries(data).forEach(([domain, ip]) => {
          if (typeof ip === 'string') {
            newEntries.push({ ip, domain, comment: '' });
          }
        });
      }
      
      if (newEntries.length === 0) {
        console.error('No valid host entries found in response');
        process.exit(1);
      }
      
      const content = readHostsFile();
      const { entries: oldEntries, before, after } = getManagedSection(content);
      
      const oldMap = new Map(oldEntries.map(e => [e.domain, e]));
      const newMap = new Map(newEntries.map(e => [e.domain, e]));
      
      const added = [];
      const updated = [];
      const removed = [];
      const unchanged = [];
      
      newEntries.forEach(entry => {
        const oldEntry = oldMap.get(entry.domain);
        if (!oldEntry) {
          added.push(entry);
        } else if (oldEntry.ip !== entry.ip) {
          updated.push({ ...entry, oldIp: oldEntry.ip });
        } else {
          unchanged.push(entry);
        }
      });
      
      oldEntries.forEach(entry => {
        if (!newMap.has(entry.domain)) {
          removed.push(entry);
        }
      });
      
      const entriesStr = newEntries
        .map(e => `${e.ip}\t${e.domain}${e.comment ? '\t' + e.comment : ''}`)
        .join('\n');
      
      const newSection = `${MARKER_START}\n${entriesStr}\n${MARKER_END}`;
      const newContent = `${before}\n${newSection}\n${after}`;
      
      writeHostsFile(newContent);
      
      console.log(`\n${colors.cyan}=== Hosts Update Summary ===${colors.reset}\n`);
      
      if (added.length > 0) {
        console.log(`${colors.green}Added (${added.length}):${colors.reset}`);
        added.forEach(e => {
          console.log(`  ${colors.green}+ ${e.ip}\t${e.domain}${colors.reset}`);
        });
        console.log();
      }
      
      if (updated.length > 0) {
        console.log(`${colors.yellow}Updated (${updated.length}):${colors.reset}`);
        updated.forEach(e => {
          console.log(`  ${colors.yellow}~ ${e.oldIp} -> ${e.ip}\t${e.domain}${colors.reset}`);
        });
        console.log();
      }
      
      if (removed.length > 0) {
        console.log(`${colors.red}Removed (${removed.length}):${colors.reset}`);
        removed.forEach(e => {
          console.log(`  ${colors.red}- ${e.ip}\t${e.domain}${colors.reset}`);
        });
        console.log();
      }
      
      let totalMessage = `Total: ${newEntries.length} entries`;
      const parts = [];
      if (added.length > 0) parts.push(`${added.length} added`);
      if (updated.length > 0) parts.push(`${updated.length} updated`);
      if (removed.length > 0) parts.push(`${removed.length} removed`);
      if (unchanged.length > 0) parts.push(`${unchanged.length} unchanged`);
      
      if (parts.length > 0) {
        totalMessage += ` (${parts.join(', ')})`;
      }
      
      console.log(`${colors.cyan}${totalMessage}${colors.reset}`);
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}
