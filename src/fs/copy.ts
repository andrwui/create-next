import { mkdir, writeFile, readdir, readFile } from 'fs/promises'
import path from 'path'

export const copyFolder = async (from: string, to: string) => {
  await mkdir(to, { recursive: true })
  const entries = await readdir(from, { withFileTypes: true })

  await Promise.all(
    entries.map(async (e) => {
      const src = path.join(from, e.name)
      const dst = path.join(to, e.name)

      if (e.isDirectory()) {
        await copyFolder(src, dst)
      } else {
        await writeFile(dst, await readFile(src))
      }
    }),
  )
}
