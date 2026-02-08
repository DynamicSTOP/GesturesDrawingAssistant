export const isLocalhost = (remoteAddress: string | undefined, host: string) => remoteAddress !== undefined && (remoteAddress === host || remoteAddress === "127.0.0.1" || remoteAddress === "::1" || remoteAddress === "localhost");


export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}