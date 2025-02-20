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
  { name: 'motion', value: 'motion' },
  { name: 'lucide icons', value: 'lucide-react' },
]

// Setup keyboard handling
const setupKeyboardHandling = () => {
  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true)
  }

  process.stdin.on('keypress', (str, key) => {
    if ((key.name === 'q' && !key.shift) || key.name === 'escape') {
      console.log('\n\nExiting...')
      // Show cursor before exiting
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

const installPackages = async (deps, isDev = false, type = '') => {
  // Temporarily disable keyboard handling during installation
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }

  try {
    for (const dep of deps) {
      writeStatus(`installing${type} packages... ${dep}`)
      const success = executeCommand(
        `bun add ${isDev ? '-D ' : ''}${dep}`,
        `Failed to install ${dep}`,
      )
      if (!success) return false
    }
    writeStatus(`installing${type} packages... done ✓`)
    return true
  } catch (error) {
    console.error(`\nFailed to install${type} packages:`, error.message)
    return false
  } finally {
    // Re-enable keyboard handling after installation
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true)
    }
  }
}

const cleanupAndExit = (code = 0) => {
  // Ensure cursor is visible
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
          prefix: '',
          style: {
            answer: (string) => string,
            message: (string) => string,
            error: (string) => string,
            defaultAnswer: (string) => string,
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
          prefix: '',
          icon: {
            checked: ' ',
            unchecked: ' ',
          },
          helpMode: 'never',
        },
      },
    ])
    writeStatus('creating next app...')
    const createNextAppCmd = `bunx --bun create-next-app@latest ${isHere ? '.' : projectName
      } --ts --app --src-dir --skip-install --use-bun --empty --turbo --yes`

    if (!executeCommand(createNextAppCmd, 'Failed to create Next.js app')) {
      cleanupAndExit(1)
    }
    writeStatus('creating next app... done ✓')

    // Change to project directory if not using --here
    if (!isHere) {
      process.chdir(projectName)
    }

    console.log('') // Add a newline before starting installations

    // Install all regular dependencies
    const allDeps = [...dependencies, ...selectedPackages]
    if (!(await installPackages(allDeps))) {
      cleanupAndExit(1)
    }
    console.log('')

    // Install dev dependencies
    if (!(await installPackages(devDependencies, true, ' dev'))) {
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
    console.log('bun dev\n')

    // Clean exit with cursor restored
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

