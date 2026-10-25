import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const targets = [
  { name: 'api', color: '\x1b[38;5;107m', cwd: path.join(root, 'server'), args: ['run', 'dev'] },
  { name: 'web', color: '\x1b[38;5;173m', cwd: path.join(root, 'app'), args: ['run', 'dev'] },
]

const children = targets.map((t) => {
  const child = spawn(npm, t.args, { cwd: t.cwd, shell: process.platform === 'win32' })
  const prefix = `${t.color}${t.name.padEnd(3)}\x1b[0m │ `
  const pipe = (stream, out) => {
    let buffer = ''
    stream.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) if (line.trim()) out.write(prefix + line + '\n')
    })
  }
  pipe(child.stdout, process.stdout)
  pipe(child.stderr, process.stderr)
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      process.stderr.write(`${prefix}exited with code ${code}\n`)
    }
  })
  return child
})

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
