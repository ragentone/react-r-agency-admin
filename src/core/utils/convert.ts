type ByteUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

const FACTORS: Record<ByteUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
};

function convertBytes(bytes: number, to: ByteUnit, decimals = 2): number {
  return +(bytes / FACTORS[to]).toFixed(decimals);
}

export { convertBytes };
