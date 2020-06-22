import * as fs from 'fs';

export function ensureFullPath(path: string): void {
  const pathSplit: string[] = path.split('/');

    pathSplit.reduce((currentPath: string, nextFolder: string) => {
      if (nextFolder) {
        currentPath += `/${nextFolder}`;

        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
      }

      return currentPath;
    }, '');
}

export function scrubData (dataString: string, keys: string[]): string {
  if (dataString) {
    (keys || this.keysToScrub).forEach(key => {
      dataString = dataString.replace(new RegExp(`("${key}":)+"+.{0,}"+`, 'gi'), `"key_removed": true`);
    });
  }

  return dataString;
}