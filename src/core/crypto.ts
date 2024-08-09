export const decrypt = async (key: Uint8Array, data: ArrayBuffer): Promise<ArrayBuffer> => {
  const ivSize = 12;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    {
      name: "AES-GCM",
    },
    false,
    ['decrypt']
  );

  const iv = new Uint32Array(data.slice(0, ivSize));
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    data.slice(ivSize)
  );//.catch((err: DOMException) => console.error(err));
};