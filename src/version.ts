import packageInfo from '../package.json';

/**
 * Real application version from project configuration (package.json).
 * Do not hardcode or invent arbitrary versions.
 */
export const APP_VERSION: string = packageInfo.version;
export const APP_NAME: string = packageInfo.name || 'YAAD';
