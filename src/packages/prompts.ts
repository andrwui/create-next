import inquirer from 'inquirer'

import { PACKAGE_FLAT_MAP, PACKAGE_REGISTRY } from './registry'
import { checkboxTheme } from '../cli/inquirer-styles'

export const optionalDependenciesChoices = Object.entries(PACKAGE_REGISTRY).flatMap(
  ([group, packages]) => [
    new inquirer.Separator(group),
    ...Object.entries(packages).map(([name, def]) => ({
      name,
      value: name,
      checked: def.checked,
    })),
  ],
)

export const getExtraDependenciesChoices = (packageName: string) => {
  const pkg = PACKAGE_FLAT_MAP[packageName]
  if (!pkg?.extras) return []
  return Object.entries(pkg.extras).map(([name, def]) => ({
    name,
    value: name,
    checked: def.checked,
  }))
}

export const promptOptionalPackages = async () => {
  const { regular } = await inquirer.prompt([
    {
      type: 'checkbox',
      loop: false,
      pageSize: 2000,
      name: 'regular',
      message: 'packages to install',
      choices: optionalDependenciesChoices,
      theme: checkboxTheme,
    },
  ])

  return regular as string[]
}

export const promptExtraPackages = async (packageNames: string[]) => {
  const packagesWithExtras = packageNames.filter((name) => {
    const choices = getExtraDependenciesChoices(name)
    return choices && choices.length > 0
  })

  if (!packagesWithExtras.length) {
    return {}
  }

  const extras = await inquirer.prompt([
    ...packagesWithExtras.map((name) => ({
      loop: false,
      pageSize: 2000,
      type: 'checkbox',
      name: name,
      message: `extra packages for ${name}`,
      choices: getExtraDependenciesChoices(name),
      theme: checkboxTheme,
    })),
  ])

  return extras
}
