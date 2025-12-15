import fs from 'fs'
import inquirer from 'inquirer'
import { inputTheme } from './cli/inquirer-styles'
import { promptExtraPackages, promptOptionalPackages } from './packages/prompts'
import { resolveExtraPackages, resolveOptionalPackages } from './packages/resolver'
import { Command } from 'commander'
import { installPackages } from './packages/installer'
import { cwd } from 'process'
import path from 'path'
import { createNext } from './next/createNext'
import ora from 'ora'
import { SPINNER_COLOR } from './constants'
import { copyFolder } from './fs/copy'
import { getPackageManager } from './packages/package-manager'
import { REQ_DEPENDENCIES, REQ_DEV_DEPENDENCIES } from './packages/required'

const templateDir = path.join(process.cwd(), 'templates')
async function main() {
  const program = new Command()
  program.option('-d, --dir <path>', 'directory to use')
  program.parse(process.argv)

  const args = program.args

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'project name:',
      default: 'my-andrwui-next',
      theme: inputTheme,
    },
  ])

  console.log('')

  const projectDir = args[0] === '.' ? cwd() : path.join(cwd(), projectName)

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true })
  }

  const selectedPackages = await promptOptionalPackages()
  const extras = await promptExtraPackages(selectedPackages)

  const resolvingSpinner = ora('resolving dependencies...').start()
  resolvingSpinner.color = SPINNER_COLOR
  const resolvedOptional = resolveOptionalPackages(selectedPackages)
  const resolvedExtras = resolveExtraPackages(extras)
  resolvingSpinner.stopAndPersist({ symbol: '󰄬' })

  const nextSpinner = ora('initializing next project...').start()
  nextSpinner.color = SPINNER_COLOR
  await createNext(projectDir)
  nextSpinner.stopAndPersist({ symbol: '󰄬' })

  const installSpinner = ora('installing packages...').start()
  installSpinner.color = SPINNER_COLOR

  installSpinner.text = 'installing required packages...'
  await installPackages(REQ_DEPENDENCIES, false, projectDir, installSpinner)
  await installPackages(REQ_DEV_DEPENDENCIES, true, projectDir, installSpinner)

  installSpinner.text = 'installing selected packages...'
  await installPackages(resolvedOptional.regular, false, projectDir, installSpinner)
  await installPackages(resolvedOptional.dev, true, projectDir, installSpinner)

  installSpinner.text = 'installing selected extra packages...'
  await installPackages(resolvedExtras.regular, false, projectDir, installSpinner)
  await installPackages(resolvedExtras.dev, true, projectDir, installSpinner)

  installSpinner.stopAndPersist({ symbol: '󰄬' })

  const copySpinner = ora('copying templates...').start()
  copySpinner.color = SPINNER_COLOR
  await copyFolder(templateDir, projectDir)
  copySpinner.stopAndPersist({ symbol: '󰄬' })

  console.log('\ndone\n')
  console.log(`cd ${projectName}`)
  console.log(`${getPackageManager()} run dev\n`)
}

main().catch((e) => {
  if (e instanceof Error && e.name === 'ExitPromptError') {
    console.log('exiting...')
  } else {
    throw e
  }
})
