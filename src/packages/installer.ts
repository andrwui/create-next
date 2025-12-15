import { spawn } from 'node:child_process'
import { getPackageManager } from './package-manager'
import ora, { type Ora } from 'ora'
import { SPINNER_COLOR } from '../constants'

export async function installPackages(
  packages: string[],
  isDev: boolean = false,
  dir: string,
  spinner: Ora,
) {
  for (const pkg of packages) {
    spinner.text = `installing ${pkg}`
    await new Promise<void>((resolve, reject) => {
      const args = ['install', pkg]
      if (isDev) args.push('-D')
      const child = spawn(getPackageManager(), args, { cwd: dir, stdio: 'pipe' })

      let stderr = ''
      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Failed to install ${pkg} (exit code ${code})\n${stderr}`))
        }
      })
    })
  }
}
