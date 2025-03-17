#!/usr/bin/env node
import { execSync } from 'child_process'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesDir = path.join(__dirname, '..', 'templates')

const dependencies = ['tailwindcss@latest', 'postcss', 'tailwind-merge', '@tailwindcss/postcss']

const devDependencies = [
  'eslint',
  '@eslint/js',
  '@next/eslint-plugin-next',
  'eslint-plugin-prettier',
  'eslint-plugin-react',
  'typescript-eslint',
  'eslint-config-prettier',
  'prettier-plugin-tailwindcss',
  '@trivago/prettier-plugin-sort-imports',
]

const optionalPackages = [
  { name: 'r3f', value: 'three @types/three @react-three/fiber' },
  { name: 'lenis', value: 'lenis' },
  { name: 'motion', value: 'motion' },
  { name: 'lucide', value: 'lucide-react' },
  { name: 'zustand', value: 'zustand' },
  { name: 'react-spring', value: 'react-spring' },
]

const r3fAuxPackages = [
  { name: 'r3f-drei', value: '@react-three/drei', checked: true },
  { name: 'r3f-spring', value: '@react-spring/three', checked: true },
  { name: 'r3f-custom-shader-material', value: 'three-custom-shader-material' },
  { name: 'r3f-postprocessing', value: '@react-three/postprocessing' },
  { name: 'r3f-flex', value: '@react-three/flex' },
]

const packageManagers = [
  { name: 'bun', value: 'bun', install: 'add', installDev: 'add -D', createNextApp: '--use-bun', createCommand: 'bunx --bun' },
  { name: 'pnpm', value: 'pnpm', install: 'add', installDev: 'add -D', createNextApp: '--use-pnpm', createCommand: 'pnpm dlx' },
  { name: 'npm', value: 'npm', install: 'install', installDev: 'install --save-dev', createNextApp: '--use-npm', createCommand: 'npx' },
  { name: 'yarn', value: 'yarn', install: 'add', installDev: 'add -D', createNextApp: '--use-yarn', createCommand: 'yarn dlx' },
]

const setupKeyboardHandling = () => {
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  process.stdin.on('keypress', (_, key) => {
    if ((key.name === 'q' && !key.shift) || key.name === 'escape') {
      console.log('\n\nExiting...')
      process.stdout.write('\u001B[?25h')
      process.exit(0)
    }
  })
}

const clearLine = () => {
  process.stdout.write('\r\x1b[K')
}

const writeStatus = (message) => {
  clearLine()
  process.stdout.write(message)
}

const executeCommand = (command, errorMessage) => {
  try {
    execSync(command, {
      stdio: 'ignore',
      shell: true,
    })
    return true
  } catch (error) {
    console.error(`\n${errorMessage}:`, error.message)
    return false
  }
}

const copyTemplateFolder = (srcDir, destDir) => {
  if (!fs.existsSync(srcDir)) {
    console.error(`Template directory not found: ${srcDir}`)
    return false
  }

  try {
    const items = fs.readdirSync(srcDir)
    items.forEach((item) => {
      const srcPath = path.join(srcDir, item)
      const destPath = path.join(destDir, item)
      if (fs.statSync(srcPath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true })
        copyTemplateFolder(srcPath, destPath)
      } else {
        const content = fs.readFileSync(srcPath, 'utf-8')
        fs.writeFileSync(destPath, content)
      }
    })
    return true
  } catch (error) {
    console.error('Error copying template files:', error.message)
    return false
  }
}

const installPackages = async (deps, isDev = false, type = '', selectedPM) => {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }

  try {
    for (const dep of deps) {
      writeStatus(`installing${type} packages... ${dep}`)
      const command = `${selectedPM.name} ${isDev ? selectedPM.installDev : selectedPM.install} ${dep}`
      const success = executeCommand(command, `Failed to install ${dep}`)
      if (!success) return false
    }
    writeStatus(`installing${type} packages... done ✓`)
    return true
  } catch (error) {
    console.error(`\nFailed to install${type} packages:`, error.message)
    return false
  } finally {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
  }
}

const cleanupAndExit = (code = 0) => {
  process.stdout.write('\u001B[?25h')
  process.exit(code)
}

const init = async () => {
  try {
    setupKeyboardHandling()

    const isHere = process.argv.includes('--here')
    let projectName = process.argv[2]

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'project name:',
        default: 'project-name',
        theme: {
          prefix: '\uf002',
          style: {
            answer: (string) => string,
            message: (string) => string,
            error: (string) => string,
            defaultAnswer: (string) => `\x1b[2m${string}\x1b[0m`,
          },
        },
      },
    ])
    projectName = answers.projectName

    const { selectedPackages } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPackages',
        message: 'select optional packages:',
        choices: optionalPackages,
        theme: {
          style: {
            answer: (text) => ' ' + text,
            message: (text) => text,
            error: (text) => text,
            defaultAnswer: (text) => text,
            help: () => '',
            highlight: (text) => text,
            key: (text) => text,
            disabledChoice: (text) => text,
            description: (text) => text,
          },
          prefix: '\uf02d',
          icon: {
            checked: ' \uf0c8',
            unchecked: ' \uf096',
          },
          helpMode: 'never',
        },
      },
    ])

    let selectedR3fAuxPackages = []
    if (selectedPackages.some(pkg => pkg.includes('three'))) {
      const { r3fAuxSelection } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'r3fAuxSelection',
          message: 'r3f aux packages:',
          choices: r3fAuxPackages,
          theme: {
            style: {
              answer: (text) => ' ' + text,
              message: (text) => text,
              error: (text) => text,
              defaultAnswer: (text) => text,
              help: () => '',
              highlight: (text) => text,
              key: (text) => text,
              disabledChoice: (text) => text,
              description: (text) => text,
            },
            prefix: '\uf02d',
            icon: {
              checked: ' \uf0c8',
              unchecked: ' \uf096',
            },
            helpMode: 'never',
          },
        },
      ])
      selectedR3fAuxPackages = r3fAuxSelection
    }

    const { packageManager } = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: 'select package manager:',
        choices: packageManagers,
        theme: {
          style: {
            answer: (text) => ' ' + text,
            message: (text) => text,
            error: (text) => text,
            defaultAnswer: (text) => text,
            help: () => '',
            highlight: (text) => text,
            key: (text) => text,
            disabledChoice: (text) => text,
            description: (text) => text,
          },
          prefix: '\udb84\udc64',
          helpMode: 'never',
        },
      },
    ])

    // Get the full package manager object based on the selected value
    const selectedPM = packageManagers.find(pm => pm.value === packageManager)

    console.log(`selected package manager: ${selectedPM.name}`)

    writeStatus('creating next app...')
    const createNextAppCmd = `${selectedPM.createCommand} create-next-app@latest ${isHere ? '.' : projectName} --ts --app --src-dir --skip-install ${selectedPM.createNextApp} --empty --turbo --yes`

    if (!executeCommand(createNextAppCmd, 'Failed to create Next.js app')) {
      cleanupAndExit(1)
    }
    writeStatus('creating next app... done ✓')

    if (!isHere) {
      process.chdir(projectName)
    }

    console.log('')

    const allDeps = [...dependencies, ...selectedPackages, ...selectedR3fAuxPackages]
    if (!(await installPackages(allDeps, false, '', selectedPM))) {
      cleanupAndExit(1)
    }
    console.log('')

    if (!(await installPackages(devDependencies, true, ' dev', selectedPM))) {
      cleanupAndExit(1)
    }
    console.log('')

    writeStatus('copying template files...')
    if (!copyTemplateFolder(templatesDir, process.cwd())) {
      cleanupAndExit(1)
    }
    writeStatus('copying template files... done ✓\n')

    console.log('\nsetup completed.\n')
    console.log(`next step${isHere ? '' : 's'}:\n`)
    if (!isHere) {
      console.log(`cd ${projectName}`)
    }
    console.log(`${selectedPM.name} ${selectedPM.name === 'npm' ? 'run ' : ''}dev\n`)

    cleanupAndExit(0)
  } catch (error) {
    console.error('\nAn unexpected error occurred:', error.message)
    cleanupAndExit(1)
  }
}

init().catch((error) => {
  console.error('\nFailed to initialize project:', error.message)
  cleanupAndExit(1)
})
