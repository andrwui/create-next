#!/usr/bin/env node
import { execSync } from 'child_process'
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesDir = path.join(__dirname, '..', 'templates')

const cbTheme = {
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
}

const inputTheme = {
  prefix: '\uf002',
  style: {
    answer: (string) => string,
    message: (string) => string,
    error: (string) => string,
    defaultAnswer: (string) => `\x1b[2m${string}\x1b[0m`,
  },
}

const listTheme = {
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
}

const deps = ['tailwindcss@latest', 'postcss', 'tailwind-merge', '@tailwindcss/postcss']
const devDeps = [
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

const optional = [
  { name: 'r3f', value: 'three @types/three @react-three/fiber' },
  { name: 'gsap', value: 'gsap @gsap/react' },
  { name: 'lenis', value: 'lenis' },
  { name: 'motion', value: 'motion' },
  { name: 'lucide', value: 'lucide-react' },
  { name: 'prisma', value: 'prisma @prisma/client' },
  { name: 'zustand', value: 'zustand' },
  { name: 'supabase', value: '@supabase/supabase-js @supabase/auth-helpers-nextjs' },
]

const r3fExtras = [
  { name: '@react-three/drei', value: '@react-three/drei', checked: true },
  { name: '@react-three/postprocessing', value: '@react-three/postprocessing' },
  { name: '@react-three/flex', value: '@react-three/flex' },
]

const managers = {
  bun: { cmd: 'bunx --bun', app: '--use-bun', i: 'add', d: 'add -D' },
  pnpm: { cmd: 'pnpm dlx', app: '--use-pnpm', i: 'add', d: 'add -D' },
  npm: { cmd: 'npx', app: '--use-npm', i: 'install', d: 'install --save-dev' },
  yarn: { cmd: 'yarn dlx', app: '--use-yarn', i: 'add', d: 'add -D' },
}

const run = (cmd) => {
  try {
    execSync(cmd, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const install = (pkgs, dev, m) =>
  pkgs.every((p) => run(`${m} ${dev ? managers[m].d : managers[m].i} ${p}`))

const copy = (from, to) => {
  fs.readdirSync(from).forEach((f) => {
    const src = path.join(from, f)
    const dst = path.join(to, f)
    fs.statSync(src).isDirectory()
      ? (fs.mkdirSync(dst, { recursive: true }), copy(src, dst))
      : fs.writeFileSync(dst, fs.readFileSync(src, 'utf8'))
  })
}

const main = async () => {
  const isHere = process.argv.includes('--here')
  const { projectName } = await inquirer.prompt([
    {
      name: 'projectName',
      message: 'project name:',
      default: 'my-andrwui-next',
      theme: inputTheme,
    },
  ])
  const { selectedPackages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedPackages',
      message: 'select optional packages',
      choices: optional,
      pageSize: 20,
      loop: false,
      theme: cbTheme,
    },
  ])

  let r3fExtra = []
  if (selectedPackages.some((p) => p.includes('three'))) {
    const res = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'r3fExtra',
        message: 'select r3f extras',
        choices: r3fExtras,
        loop: false,
        pageSize: 20,
        theme: cbTheme,
      },
    ])
    r3fExtra = res.r3fExtra
  }

  const { pm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'pm',
      message: 'package manager',
      choices: Object.keys(managers),
      theme: listTheme,
    },
  ])
  const m = pm

  const cmd = `${managers[m].cmd} create-next-app@latest ${isHere ? '.' : projectName} --ts --app --src-dir --skip-install ${managers[m].app} --empty --turbo --yes`
  if (!run(cmd)) process.exit(1)
  if (!isHere) process.chdir(projectName)

  const flatDeps = [...deps, ...selectedPackages.flatMap((p) => p.split(' ')), ...r3fExtra]
  if (!install(flatDeps, false, m) || !install(devDeps, true, m)) process.exit(1)

  copy(templatesDir, process.cwd())

  console.log('\ndone\n')
  if (!isHere) console.log(`cd ${projectName}`)
  console.log(`${pm} ${pm === 'npm' ? 'run ' : ''}dev\n`)
}

main()
