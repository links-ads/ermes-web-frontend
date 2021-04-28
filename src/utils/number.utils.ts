import seedrandom from 'seedrandom'

export function intInRange(max: number, min: number = 0, seed?: string): number {
  const rng = seedrandom.xor4096(seed)
  const r = rng()
  const rint = Math.floor(r * (max - min + 1) + min)
  console.debug('RANDOM', r, seed, rint, min, max)
  return rint
}
