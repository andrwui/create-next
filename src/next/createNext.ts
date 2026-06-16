import { exec } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getPackageManagerInfo } from '../packages/package-manager'

export async function createNext(targetDir: string) {
  const { manager } = getPackageManagerInfo()

  const pmFlags: Record<string, string> = {
    npm: '--use-npm',
    yarn: '--use-yarn',
    pnpm: '--use-pnpm',
    bun: '--use-bun',
  }

  const runner =
    manager === 'npm'
      ? 'npx'
      : manager === 'yarn'
        ? 'yarn dlx'
        : manager === 'pnpm'
          ? 'pnpm dlx'
          : 'bunx'

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'andrwui-next-'))

  const cmd = [
    runner,
    'create-next-app@latest',
    tmpDir,
    '--ts',
    '--app',
    '--src-dir',
    '--skip-install',
    pmFlags[manager],
    '--empty',
    '--yes',
  ].join(' ')

  await new Promise<void>((resolve, reject) => {
    exec(cmd, (error, _, stderr) => {
      if (error) {
        reject(new Error(`Failed to create Next.js app:\n${stderr}\n${error.message}`))
      } else {
        resolve()
      }
    })
  })

  for (const file of fs.readdirSync(tmpDir)) {
    const src = path.join(tmpDir, file)
    const dest = path.join(targetDir, file)
    fs.cpSync(src, dest, { recursive: true, force: true })
  }

  fs.rmSync(tmpDir, { recursive: true, force: true })
}
