export function downloadBlobAsFile(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchorEl = document.createElement("a");
  anchorEl.href = objectUrl;
  anchorEl.download = fileName;
  anchorEl.click();
  URL.revokeObjectURL(objectUrl);
}