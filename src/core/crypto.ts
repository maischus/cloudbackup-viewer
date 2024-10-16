export const importKey = async (key: Uint8Array): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'raw',
    key,
    {
      name: "AES-GCM",
    },
    false,
    ['decrypt']
  );
};

export const decrypt = async (key: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> => {
  const ivSize = 12;
  const iv = new Uint32Array(data.slice(0, ivSize));
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data.slice(ivSize)
  );//.catch((err: DOMException) => console.error(err));
};