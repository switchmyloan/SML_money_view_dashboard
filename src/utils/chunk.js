export function chunkArray(arr, chunkSize = 5000) {
  const results = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    results.push(arr.slice(i, i + chunkSize));
  }
  return results;
}

export async function processChunks(data, chunkSize = 5000) {
  const chunks = chunkArray(data, chunkSize);
  const processed = [];

  for (const chunk of chunks) {
    processed.push(...chunk);
    // Prevent UI freeze
    await new Promise((res) => setTimeout(res));
  }

  return processed;
}
