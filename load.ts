import fs from 'fs'
import path from 'path'
import shell from 'shelljs';
import repos from './workspace/pre/01-markdown.json';

for (const [id, url] of Object.entries(repos)) {
  const [username, repo] = url.replace('https://github.com/', '').split('/')
  const folder = `${id}_${username}`
  let target: string
  if (!fs.existsSync(target = path.resolve(__dirname, 'repos', folder, repo))) {
    try {
      console.log(`Loading repo ${url}`)
      shell.exec(`git submodule add ${url} "${target}"`)
    } catch {
      console.error(`Error loading ${url}`)
    }
  } else {
    console.log(`Repo ${url} already loaded`)
  }
}
