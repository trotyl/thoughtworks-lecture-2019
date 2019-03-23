const main = require('../main/main')

describe('taxi fee', () => {
  describe('without latency', () => {
    it('should be flag-fall price when no more than 2km', () => {
      expect(main(0)).toBe(6)
      expect(main(2)).toBe(6)
    })

    it('should calculate properly when more than 2km but no more than 8km', () => {
      expect(main(3)).toBe(7)
      expect(main(8)).toBe(11)
    })

    it('should calculate properly when more than 8km', () => {
      expect(main(9)).toBe(12)
      expect(main(12)).toBe(16)
    })
  })

  describe('with latency', () => {
    it('should count additional price in', () => {
      expect(main(0, 4)).toBe(7)
      expect(main(3, 1)).toBe(7)
    })
  })
})
