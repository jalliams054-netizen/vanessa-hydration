import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../src')
const files = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(js|jsx)$/.test(entry)) files.push(full)
  }
}
walk(root)

const short = (file) => file.replace(root + '/', 'src/')
let problems = 0
const report = (file, msg) => {
  problems += 1
  console.log(`PROBLEM  ${short(file)}: ${msg}`)
}

const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]))

for (const [file, source] of sources) {
  for (const match of source.matchAll(/(?:from\s+|import\s+)['"](\.[^'"]+)['"]/g)) {
    const spec = match[1]
    const target = resolve(dirname(file), spec)
    if (!existsSync(target) && !existsSync(`${target}.js`) && !existsSync(`${target}.jsx`)) {
      report(file, `unresolved import '${spec}'`)
    }
  }

  const count = (ch) => [...source].filter((c) => c === ch).length
  if (count('{') !== count('}')) report(file, 'unbalanced braces')
  if (count('(') !== count(')')) report(file, 'unbalanced parentheses')
  if (source.includes('`') && count('`') % 2 !== 0) report(file, 'unbalanced backticks')

  for (const dead of ['lib/registration', 'cleanUrl', 'PHASES', 'setGoal', 'resetToday', 'notifyClient', 'SNAPSHOT']) {
    if (source.includes(dead)) report(file, `references removed '${dead}'`)
  }

  for (const match of source.matchAll(/import\s+([A-Z][A-Za-z]*)\s+from\s+['"](\.[^'"]+)['"]/g)) {
    const [, name, spec] = match
    const target = resolve(dirname(file), spec)
    const real = existsSync(target) ? target : existsSync(`${target}.jsx`) ? `${target}.jsx` : null
    if (real && !/(export default|export\s*\{)/.test(sources.get(real) ?? '')) {
      report(file, `'${name}' imported from '${spec}' which has no export`)
    }
  }
}

console.log(problems === 0 ? `\nOK: ${files.length} modules clean` : `\n${problems} PROBLEM(S)`)
