export async function downloadGamePackage(name: string, content: Uint8Array) {
  if (window.desktop) {
    return Boolean(await window.desktop.saveGamePackage(name, content));
  }
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
