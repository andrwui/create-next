import { PACKAGE_FLAT_MAP } from './registry'

export function resolveOptionalPackages(packageNames: string[]) {
  const regular = new Set<string>()
  const dev = new Set<string>()

  for (const name of packageNames) {
    const pkg = PACKAGE_FLAT_MAP[name]

    pkg.regular.forEach((dep) => regular.add(dep))
    pkg.dev?.forEach((dep) => dev.add(dep))
  }
  return {
    regular: [...regular],
    dev: [...dev],
  }
}

export function resolveExtraPackages(extraPackage: Record<string, string[]>) {
  const regular = new Set<string>()
  const dev = new Set<string>()

  for (const [name, deps] of Object.entries(extraPackage)) {
    const packages = PACKAGE_FLAT_MAP[name].extras
    if (!packages) continue

    for (const dep of deps) {
      const pkg = packages[dep]
      if (!pkg) continue
      pkg.regular.forEach((dep) => regular.add(dep))
      pkg.dev?.forEach((dep) => dev.add(dep))
    }
  }

  return {
    regular: [...regular],
    dev: [...dev],
  }
}
