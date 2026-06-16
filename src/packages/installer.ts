import { spawn } from 'node:child_process'
import { getPackageManager } from './package-manager'
import { type Ora } from 'ora'

export async function installPackages(
  packages: string[],
  isDev: boolean = false,
  dir: string,
  spinner: Ora,
) {
  if (packages.length === 0) return

  const pm = getPackageManager()
  spinner.text = `installing ${packages.join(', ')}`
  await new Promise<void>((resolve, reject) => {
    const args = ['install', ...packages]
    if (isDev) args.push('-D')
    const child = spawn(pm, args, { cwd: dir, stdio: 'pipe' })

    let stderr = ''
    let stdout = ''
    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })
    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(
          new Error(
            `Failed to install packages with ${pm} (exit code ${code})\n${stdout}${stderr}`,
          ),
        )
      }
    })
  })
}
