export function buildFolderPath(siteId, basePath) {
  const bp = basePath.endsWith('\\') ? basePath : basePath + '\\';
  return bp + siteId + '\\';
}

export function buildFilePath(siteId, fileName, basePath) {
  return buildFolderPath(siteId, basePath) + fileName;
}

export function toFileUrl(windowsPath) {
  return 'file:///' + windowsPath.replace(/\\/g, '/');
}
