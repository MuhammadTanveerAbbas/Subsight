import { describe, it, expect } from 'vitest'
import { DARK_TOKENS, LIGHT_TOKENS } from '../design-tokens'

describe('exact theme tokens', () => {
  it('uses exact black and exact white backgrounds', () => {
    expect(DARK_TOKENS['--bg']).toBe('#000000')
    expect(LIGHT_TOKENS['--bg']).toBe('#ffffff')
  })

  it('uses one surface step between background and raised surface', () => {
    expect(DARK_TOKENS['--surface']).toBe('#0a0a0a')
    expect(DARK_TOKENS['--surface2']).toBe('#141414')
    expect(LIGHT_TOKENS['--surface']).toBe('#f5f5f5')
    expect(LIGHT_TOKENS['--surface2']).toBe('#ebebeb')
  })

  it('keeps glow tokens transparent', () => {
    for (const [key, value] of Object.entries(DARK_TOKENS)) {
      if (key.includes('glow')) expect(value).toMatch(/,0\)$/)
    }
    for (const [key, value] of Object.entries(LIGHT_TOKENS)) {
      if (key.includes('glow')) expect(value).toMatch(/,0\)$/)
    }
  })
})
