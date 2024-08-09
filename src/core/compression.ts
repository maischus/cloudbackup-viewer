
export const decompress = async (blob: Blob): Promise<Blob> => {
  const ds = new DecompressionStream("gzip");
  const decompressionStream = blob.stream().pipeThrough(ds);
  return await new Response(decompressionStream).blob();
};

export const compress = async (blob: Blob): Promise<Blob> => {
  const compressedReadableStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
  return await new Response(compressedReadableStream).blob();
};

/*export const compress = (readableStream: ReadableStream): ReadableStream => {
  const compressedReadableStream = readableStream.pipeThrough(new CompressionStream('gzip'));
  return compressedReadableStream;
};*/