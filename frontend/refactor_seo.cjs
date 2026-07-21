const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/pages');

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file uses useSEO
  if (!content.includes('useSEO')) return;

  // Replace import
  content = content.replace(
    /import\s*{\s*useSEO\s*}\s*from\s*['"]\.\.\/hooks\/useSEO['"];?/g,
    'import { SEO } from "../components/SEO";'
  );

  // Extract the useSEO(title, description) call
  // We look for useSEO( ... ); and capture the arguments. 
  // It could be multiline if formatted. 
  const useSeoRegex = /useSEO\(([\s\S]*?)\);?/g;
  let seoArgs = null;
  content = content.replace(useSeoRegex, (match, args) => {
    seoArgs = args.trim();
    return ''; // Remove the hook call
  });

  if (seoArgs) {
    // Split by comma, but be careful with commas inside strings or backticks. 
    // Usually it's just title, description.
    // Let's just pass the whole thing into an expression if possible, or try to safely split.
    // Easiest is to construct <SEO title={arg1} description={arg2} />
    
    // We can safely parse arguments if we do a naive split by the first comma that is not in a string,
    // but a simpler way: just let <SEO title={arg1} description={arg2} /> if there are 2 args,
    // or if it's dynamic just inject the whole thing as a spread? No, SEO expects { title, description }.
    
    // Let's parse args naively (assuming 2 main args separated by a comma at the top level).
    let titleArg = seoArgs;
    let descArg = '""';
    
    // Attempting a simple split on the first comma that isn't inside a nested structure is hard with Regex.
    // We will just do a lazy split by the first comma.
    const firstCommaIdx = seoArgs.indexOf(',');
    if (firstCommaIdx !== -1) {
      titleArg = seoArgs.slice(0, firstCommaIdx).trim();
      descArg = seoArgs.slice(firstCommaIdx + 1).trim();
    }
    
    // Insert <SEO title={...} description={...} /> right after the first return statement's opening tag.
    // E.g. return ( \n <div> -> return ( \n <div> \n <SEO title={...} description={...} />
    const returnRegex = /(return\s*\(\s*<[a-zA-Z]+[^>]*>)/;
    
    if (returnRegex.test(content)) {
        content = content.replace(
            returnRegex,
            `$1\n      <SEO title={${titleArg}} description={${descArg}} />`
        );
    } else {
        // Fallback for cases like `return <div...` without parenthesis
        const fallbackRegex = /(return\s*<[a-zA-Z]+[^>]*>)/;
        if (fallbackRegex.test(content)) {
            content = content.replace(
                fallbackRegex,
                `$1\n      <SEO title={${titleArg}} description={${descArg}} />`
            );
        } else {
            console.log("Could not find insertion point for", filePath);
        }
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${path.basename(filePath)}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      refactorFile(fullPath);
    }
  }
}

walkDir(directoryPath);
