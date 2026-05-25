import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..');

const replacements = [
  ["@/lib/utils", "@/utils/cn"],
  ["@/lib/configurator-data", "@/utils/configurator-data"],
  ["@/lib/auth", "@/services/auth"],
  ["@/lib/brand", "@/services/brand"],
  ["@/lib/body-type", "@/services/body-type"],
  ["@/lib/car-build-api", "@/services/car-build-api"],
  ["@/lib/car-image", "@/services/car-image"],
  ["@/lib/car-model-option", "@/services/car-model-option"],
  ["@/lib/car-model", "@/services/car-model"],
  ["@/lib/car-series", "@/services/car-series"],
  ["@/lib/car-specs", "@/services/car-specs"],
  ["@/lib/configurator", "@/services/configurator"],
  ["@/lib/home-banner", "@/services/home-banner"],
  ["@/lib/inquiry-api", "@/services/inquiry-api"],
  ["@/lib/option-category", "@/services/option-category"],
  ["@/lib/option-group", "@/services/option-group"],
  ["@/lib/option-images", "@/services/option-images"],
  ["@/lib/option-item", "@/services/option-item"],
  ["@/lib/option-rule", "@/services/option-rule"],
  ["@/lib/test-drive-api", "@/services/test-drive-api"],
  ["@/components/admin/", "@/components/features/admin/"],
  ["@/components/configurator/", "@/components/features/configurator/"],
  ["@/components/layout/", "@/components/features/layout/"],
  ["@/components/ui/", "@/components/base/ui/"],
  ["@/components/language-settings", "@/components/features/layout/language-settings"],
  ["@/components/theme-provider", "@/providers/theme-provider"],
  // service internals
  ['from "./api"', 'from "@/lib/api"'],
  ["from './api'", "from '@/lib/api'"],
  ['from "./brand"', 'from "@/services/brand"'],
  ["from './brand'", "from '@/services/brand'"],
  ["from './configurator-data'", "from '@/utils/configurator-data'"],
  ["from './option-images'", "from '@/services/option-images'"],
  ['from "../constants/enums"', 'from "@/constants/enums"'],
  ["from '../constants/enums'", "from '@/constants/enums'"],
];

const skipDirs = new Set(['node_modules', '.next', 'scripts/_legacy']);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?|mjs)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  if (file.includes('phase-e-imports.mjs')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('updated:', path.relative(root, file));
  }
}
console.log(`Done. ${changed} files updated.`);
