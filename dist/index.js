// src/index.ts
import fs from "fs";
import inquirer2 from "inquirer";

// src/cli/inquirer-styles.ts
var checkboxTheme = {
  style: {
    answer: (text) => " " + text,
    message: (text) => text,
    error: (text) => text,
    defaultAnswer: (text) => text,
    help: () => "",
    highlight: (text) => text,
    key: (text) => text,
    disabledChoice: (text) => text,
    description: (text) => text
  },
  prefix: "\uF02D",
  icon: { checked: " \u{F14FB} ", unchecked: " \u{F14FC} " },
  helpMode: "never"
};
var inputTheme = {
  prefix: "\uF002",
  style: {
    answer: (s) => s,
    message: (s) => s,
    error: (s) => s,
    defaultAnswer: (s) => `\x1B[2m${s}\x1B[0m`
  }
};

// src/packages/prompts.ts
import inquirer from "inquirer";

// src/packages/registry.ts
var PACKAGE_REGISTRY = {
  "\uEB5F ui": {
    "base-ui": {
      regular: ["@base-ui/react"],
      checked: true
    },
    "radix-ui": {
      regular: ["radix-ui@latest"]
    },
    vaul: {
      regular: ["vaul"]
    }
  },
  "\uF448 design engineering": {
    gsap: {
      regular: ["gsap", "@gsap/react"]
    },
    lenis: {
      regular: ["lenis"]
    },
    motion: {
      regular: ["motion"],
      checked: true
    },
    "react-three/fiber": {
      regular: ["three", "@react-three/fiber"],
      dev: ["@types/three"],
      extras: {
        "@react-three/drei": {
          regular: ["@react-three/drei"],
          checked: true
        },
        "@react-three/postprocessing": {
          regular: ["@react-three/postprocessing"]
        },
        "@react-three/flex": {
          regular: ["@react-three/flex"]
        }
      }
    }
  },
  "\u{F060E} form management": {
    "tanstack-form": {
      regular: ["@tanstack/react-form"]
    },
    "react-hook-form": {
      regular: ["react-hook-form"]
    }
  },
  "\u{F11EF} state management": {
    "tanstack-query": { regular: ["@tanstack/react-query"] },
    "tanstack-db": { regular: ["@tanstack/react-db"] },
    "tanstack-pacer": { regular: ["@tanstack/react-pacer"] },
    zustand: { regular: ["zustand"] },
    jotai: { regular: ["jotai"] }
  },
  "\uF472 databases": {
    supabase: {
      regular: ["@supabase/supabase-js", "@supabase/auth-helpers-nextjs"]
    },
    "drizzle-orm": {
      regular: ["drizzle-orm"],
      dev: ["drizzle-kit"]
    }
  },
  "\uEA74 icons": {
    "lucide-react": {
      regular: ["lucide-react"],
      checked: true
    }
  }
};
var PACKAGE_FLAT_MAP = Object.values(PACKAGE_REGISTRY).flatMap((group) => Object.entries(group)).reduce(
  (acc, [name, def]) => {
    acc[name] = def;
    return acc;
  },
  {}
);

// src/packages/prompts.ts
var optionalDependenciesChoices = Object.entries(PACKAGE_REGISTRY).flatMap(
  ([group, packages]) => [
    new inquirer.Separator(group),
    ...Object.entries(packages).map(([name, def]) => ({
      name,
      value: name,
      checked: def.checked
    }))
  ]
);
var getExtraDependenciesChoices = (packageName) => {
  const pkg = PACKAGE_FLAT_MAP[packageName];
  if (!pkg?.extras) return [];
  return Object.entries(pkg.extras).map(([name, def]) => ({
    name,
    value: name,
    checked: def.checked
  }));
};
var promptOptionalPackages = async () => {
  const { regular } = await inquirer.prompt([
    {
      type: "checkbox",
      loop: false,
      pageSize: 2e3,
      name: "regular",
      message: "packages to install",
      choices: optionalDependenciesChoices,
      theme: checkboxTheme
    }
  ]);
  return regular;
};
var promptExtraPackages = async (packageNames) => {
  const packagesWithExtras = packageNames.filter((name) => {
    const choices = getExtraDependenciesChoices(name);
    return choices && choices.length > 0;
  });
  if (!packagesWithExtras.length) {
    return {};
  }
  const extras = await inquirer.prompt([
    ...packagesWithExtras.map((name) => ({
      loop: false,
      pageSize: 2e3,
      type: "checkbox",
      name,
      message: `extra packages for ${name}`,
      choices: getExtraDependenciesChoices(name),
      theme: checkboxTheme
    }))
  ]);
  return extras;
};

// src/packages/resolver.ts
function resolveOptionalPackages(packageNames) {
  const regular = /* @__PURE__ */ new Set();
  const dev = /* @__PURE__ */ new Set();
  for (const name of packageNames) {
    const pkg = PACKAGE_FLAT_MAP[name];
    pkg.regular.forEach((dep) => regular.add(dep));
    pkg.dev?.forEach((dep) => dev.add(dep));
  }
  return {
    regular: [...regular],
    dev: [...dev]
  };
}
function resolveExtraPackages(extraPackage) {
  const regular = /* @__PURE__ */ new Set();
  const dev = /* @__PURE__ */ new Set();
  for (const [name, deps] of Object.entries(extraPackage)) {
    const packages = PACKAGE_FLAT_MAP[name].extras;
    if (!packages) continue;
    for (const dep of deps) {
      const pkg = packages[dep];
      if (!pkg) continue;
      pkg.regular.forEach((dep2) => regular.add(dep2));
      pkg.dev?.forEach((dep2) => dev.add(dep2));
    }
  }
  return {
    regular: [...regular],
    dev: [...dev]
  };
}

// src/index.ts
import { Command } from "commander";

// src/packages/installer.ts
import { spawn } from "child_process";

// src/packages/package-manager.ts
var SUPPORTED_PACKAGE_MANAGERS = ["npm", "yarn", "pnpm", "bun"];
var DEFAULT_PACKAGE_MANAGER = "npm";
var PACKAGE_MANAGER_EXECUTABLES = {
  npm: "npx",
  yarn: "yarn dlx",
  pnpm: "pnpm dlx",
  bun: "bunx"
};
function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent === void 0) {
    return DEFAULT_PACKAGE_MANAGER;
  }
  const packageManager = SUPPORTED_PACKAGE_MANAGERS.find((manager) => userAgent.startsWith(manager));
  return packageManager ?? DEFAULT_PACKAGE_MANAGER;
}
function getPackageManagerInfo() {
  const manager = getPackageManager();
  return {
    manager,
    executable: PACKAGE_MANAGER_EXECUTABLES[manager]
  };
}

// src/packages/installer.ts
async function installPackages(packages, isDev = false, dir, spinner) {
  for (const pkg of packages) {
    spinner.text = `installing ${pkg}`;
    await new Promise((resolve, reject) => {
      const args = ["install", pkg];
      if (isDev) args.push("-D");
      const child = spawn(getPackageManager(), args, { cwd: dir, stdio: "pipe" });
      let stderr = "";
      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install ${pkg} (exit code ${code})
${stderr}`));
        }
      });
    });
  }
}

// src/index.ts
import { cwd } from "process";
import path2 from "path";

// src/next/createNext.ts
import { exec } from "child_process";
async function createNext(targetDir) {
  const { manager } = getPackageManagerInfo();
  const pmFlags = {
    npm: "--use-npm",
    yarn: "--use-yarn",
    pnpm: "--use-pnpm",
    bun: "--use-bun"
  };
  const runner = manager === "npm" ? "npx" : manager === "yarn" ? "yarn dlx" : manager === "pnpm" ? "pnpm dlx" : "bunx";
  const cmd = [
    runner,
    "create-next-app@latest",
    targetDir,
    "--ts",
    "--app",
    "--src-dir",
    "--skip-install",
    pmFlags[manager],
    "--empty",
    "--yes"
  ].join(" ");
  return new Promise((resolve, reject) => {
    exec(cmd, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// src/index.ts
import ora from "ora";

// src/constants.ts
var SPINNER_COLOR = "white";

// src/fs/copy.ts
import { mkdir, writeFile, readdir, readFile } from "fs/promises";
import path from "path";
var copyFolder = async (from, to) => {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  await Promise.all(
    entries.map(async (e) => {
      const src = path.join(from, e.name);
      const dst = path.join(to, e.name);
      if (e.isDirectory()) {
        await copyFolder(src, dst);
      } else {
        await writeFile(dst, await readFile(src));
      }
    })
  );
};

// src/packages/required.ts
var REQ_DEPENDENCIES = ["tailwind-merge", "clsx"];
var REQ_DEV_DEPENDENCIES = [
  "tailwindcss@latest",
  "postcss",
  "@tailwindcss/postcss",
  "eslint",
  "@eslint/js",
  "@next/eslint-plugin-next",
  "eslint-plugin-prettier",
  "eslint-plugin-react",
  "typescript-eslint",
  "eslint-config-prettier",
  "prettier-plugin-tailwindcss",
  "@trivago/prettier-plugin-sort-imports"
];

// src/index.ts
var templateDir = path2.join(process.cwd(), "templates");
async function main() {
  const program = new Command();
  program.option("-d, --dir <path>", "directory to use");
  program.parse(process.argv);
  const args = program.args;
  const { projectName } = await inquirer2.prompt([
    {
      type: "input",
      name: "projectName",
      message: "project name:",
      default: "my-andrwui-next",
      theme: inputTheme
    }
  ]);
  console.log("");
  const projectDir = args[0] === "." ? cwd() : path2.join(cwd(), projectName);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  const selectedPackages = await promptOptionalPackages();
  const extras = await promptExtraPackages(selectedPackages);
  const resolvingSpinner = ora("resolving dependencies...").start();
  resolvingSpinner.color = SPINNER_COLOR;
  const resolvedOptional = resolveOptionalPackages(selectedPackages);
  const resolvedExtras = resolveExtraPackages(extras);
  resolvingSpinner.stopAndPersist({ symbol: "\u{F012C}" });
  const nextSpinner = ora("initializing next project...").start();
  nextSpinner.color = SPINNER_COLOR;
  await createNext(projectDir);
  nextSpinner.stopAndPersist({ symbol: "\u{F012C}" });
  const installSpinner = ora("installing packages...").start();
  installSpinner.color = SPINNER_COLOR;
  installSpinner.text = "installing required packages...";
  await installPackages(REQ_DEPENDENCIES, false, projectDir, installSpinner);
  await installPackages(REQ_DEV_DEPENDENCIES, true, projectDir, installSpinner);
  installSpinner.text = "installing selected packages...";
  await installPackages(resolvedOptional.regular, false, projectDir, installSpinner);
  await installPackages(resolvedOptional.dev, true, projectDir, installSpinner);
  installSpinner.text = "installing selected extra packages...";
  await installPackages(resolvedExtras.regular, false, projectDir, installSpinner);
  await installPackages(resolvedExtras.dev, true, projectDir, installSpinner);
  installSpinner.stopAndPersist({ symbol: "\u{F012C}" });
  const copySpinner = ora("copying templates...").start();
  copySpinner.color = SPINNER_COLOR;
  await copyFolder(templateDir, projectDir);
  copySpinner.stopAndPersist({ symbol: "\u{F012C}" });
  console.log("\ndone\n");
  console.log(`cd ${projectName}`);
  console.log(`${getPackageManager()} run dev
`);
}
main().catch((e) => {
  if (e instanceof Error && e.name === "ExitPromptError") {
    console.log("exiting...");
  } else {
    throw e;
  }
});
