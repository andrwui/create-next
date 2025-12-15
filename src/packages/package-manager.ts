const SUPPORTED_PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm', 'bun'] as const
export const DEFAULT_PACKAGE_MANAGER = 'npm'

type PackageManager = (typeof SUPPORTED_PACKAGE_MANAGERS)[number]

const PACKAGE_MANAGER_EXECUTABLES: Record<PackageManager, string> = {
  npm: 'npx',
  yarn: 'yarn dlx',
  pnpm: 'pnpm dlx',
  bun: 'bunx',
}

export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent
  if (userAgent === undefined) {
    return DEFAULT_PACKAGE_MANAGER
  }
  const packageManager = SUPPORTED_PACKAGE_MANAGERS.find((manager) => userAgent.startsWith(manager))
  return packageManager ?? DEFAULT_PACKAGE_MANAGER
}

export function getPackageManagerExecutable(manager?: PackageManager): string {
  const pm = manager ?? getPackageManager()
  return PACKAGE_MANAGER_EXECUTABLES[pm]
}

// Or if you want both at once:
export function getPackageManagerInfo() {
  const manager = getPackageManager()
  return {
    manager,
    executable: PACKAGE_MANAGER_EXECUTABLES[manager],
  }
}
