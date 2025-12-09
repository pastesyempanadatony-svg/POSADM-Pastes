import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src');

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Pattern 1: Remove @version from package imports (e.g., "lucide-react@0.487.0" -> "lucide-react")
            // Handles both simple imports and imports with subpaths like "date-fns@4.1.0/locale"
            const versionPattern = /(['"])([^'"]+)@\d+\.\d+\.\d+([^'"]*)\1/g;
            if (versionPattern.test(content)) {
                content = content.replace(/(['"])([^'"]+)@\d+\.\d+\.\d+([^'"]*)\1/g, (match, quote, pkg, subpath) => {
                    console.log(`  Fixing: ${match} -> ${quote}${pkg}${subpath}${quote}`);
                    return `${quote}${pkg}${subpath}${quote}`;
                });
                modified = true;
            }

            // Pattern 2: Fix figma:asset imports - replace with placeholder or remove
            const figmaPattern = /import\s+\w+\s+from\s+['"]figma:asset\/[^'"]+['"];?\s*/g;
            if (figmaPattern.test(content)) {
                content = content.replace(figmaPattern, (match) => {
                    console.log(`  Removing figma import: ${match.trim()}`);
                    return '// Logo import removed - use local asset instead\n';
                });
                modified = true;
            }

            if (modified) {
                console.log(`Fixed: ${filePath}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    }
}

console.log('Starting comprehensive import cleanup...');
walk(targetDir);
console.log('Done fixing imports.');
