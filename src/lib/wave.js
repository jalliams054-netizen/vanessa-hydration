export const CREST = 26
export const SPAN = 200
export const PERIOD = 50

export function crestShapes(amp, mid) {
  let line = `M0 ${mid}`
  for (let x = 0; x < SPAN; x += PERIOD) {
    line += ` q ${PERIOD / 4} ${-amp} ${PERIOD / 2} 0 q ${PERIOD / 4} ${amp} ${PERIOD / 2} 0`
  }
  return { line, body: `${line} L${SPAN} ${CREST} L0 ${CREST} Z` }
}
