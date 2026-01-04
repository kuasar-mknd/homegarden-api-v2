import { getLandingPageHtml, getNotFoundPageHtml } from "../shared/ui/templates.js"
import fs from "fs"
import path from "path"

// Mock env if needed or ensure vars are set
// But templates.ts imports env.js which runs parsing.
// We need to set dummy env vars before importing templates.js if they are missing.

const outDir = path.resolve("verification")

fs.writeFileSync(path.join(outDir, "landing.html"), getLandingPageHtml())
fs.writeFileSync(path.join(outDir, "404.html"), getNotFoundPageHtml("/test-path"))

console.log("Static HTML generated in verification/")
