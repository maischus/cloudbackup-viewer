// https://web.dev/articles/base64-encoding
// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export const base64ToBytes = (base64: string) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

export const bytesToBase64 = (bytes: Uint8Array) => {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}