/**
 *
 * @param {string} dataURI
 * @param {string} filename
 */
export function download(dataURI, filename) {
  const a = document.createElement("a");
  a.href = dataURI;
  a.setAttribute("download", filename);
  a.click();
}
