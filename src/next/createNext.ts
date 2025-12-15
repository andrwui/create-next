import { exec } from 'node:child_process'
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

  const cmd = [
    runner,
    'create-next-app@latest',
    targetDir,
    '--ts',
    '--app',
    '--src-dir',
    '--skip-install',
    pmFlags[manager],
    '--empty',
    '--yes',
  ].join(' ')

  return new Promise<void>((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
