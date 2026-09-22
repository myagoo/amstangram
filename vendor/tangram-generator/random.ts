// Reproducible simulation randomness, not for secrets or identifiers.
export function createRandom(seed?: number): () => number {
    if (seed === undefined) return Math.random;
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
        throw new RangeError("Seed must be an unsigned 32-bit integer");
    }
    let state = seed;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}
