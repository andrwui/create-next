export type PackageDef = {
  regular: string[]
  dev?: string[]
  extras?: Record<string, PackageDef>
  checked?: boolean
}

export const PACKAGE_REGISTRY: Record<string, Record<string, PackageDef>> = {
  ' ui': {
    'base-ui': {
      regular: ['@base-ui/react'],
      checked: true,
    },
    'radix-ui': {
      regular: ['radix-ui@latest'],
    },
    vaul: {
      regular: ['vaul'],
    },
  },

  ' design engineering': {
    gsap: {
      regular: ['gsap', '@gsap/react'],
    },
    lenis: {
      regular: ['lenis'],
    },
    motion: {
      regular: ['motion'],
      checked: true,
    },
    'react-three/fiber': {
      regular: ['three', '@react-three/fiber'],
      dev: ['@types/three'],
      extras: {
        '@react-three/drei': {
          regular: ['@react-three/drei'],
          checked: true,
        },
        '@react-three/postprocessing': {
          regular: ['@react-three/postprocessing'],
        },
        '@react-three/flex': {
          regular: ['@react-three/flex'],
        },
      },
    },
  },

  '󰘎 form management': {
    'tanstack-form': {
      regular: ['@tanstack/react-form'],
    },
    'react-hook-form': {
      regular: ['react-hook-form'],
    },
  },

  '󱇯 state management': {
    'tanstack-query': { regular: ['@tanstack/react-query'] },
    'tanstack-db': { regular: ['@tanstack/react-db'] },
    'tanstack-pacer': { regular: ['@tanstack/react-pacer'] },
    zustand: { regular: ['zustand'] },
    jotai: { regular: ['jotai'] },
  },

  ' databases': {
    supabase: {
      regular: ['@supabase/supabase-js', '@supabase/auth-helpers-nextjs'],
    },
    'drizzle-orm': {
      regular: ['drizzle-orm'],
      dev: ['drizzle-kit'],
    },
  },

  ' icons': {
    'lucide-react': {
      regular: ['lucide-react'],
      checked: true,
    },
  },
}

export const PACKAGE_FLAT_MAP: Record<string, PackageDef> = Object.values(PACKAGE_REGISTRY)
  .flatMap((group) => Object.entries(group))
  .reduce(
    (acc, [name, def]) => {
      acc[name] = def
      return acc
    },
    {} as Record<string, PackageDef>,
  )
