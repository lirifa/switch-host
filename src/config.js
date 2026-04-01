import fs from 'fs';
import { CONFIG_PATH, DEFAULT_HOSTS_URL } from './utils.js';

export function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Warning: Failed to read config: ${error.message}`);
  }
  return { hostsUrl: DEFAULT_HOSTS_URL };
}

export function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing config: ${error.message}`);
    process.exit(1);
  }
}

export function showConfig() {
  const config = readConfig();
  console.log(`\n=== Switch-Host Config ===\n`);
  console.log(`hostsUrl: ${config.hostsUrl}`);
  console.log(`\nConfig file: ${CONFIG_PATH}`);
}

export function setConfig(key, value) {
  const config = readConfig();
  
  if (key === 'hostsUrl') {
    if (!value) {
      console.error('Error: URL value is required');
      process.exit(1);
    }
    config.hostsUrl = value;
    writeConfig(config);
    console.log(`Set hostsUrl to: ${value}`);
  } else {
    console.error(`Unknown config key: ${key}`);
    console.log('Available keys: hostsUrl');
    process.exit(1);
  }
}
