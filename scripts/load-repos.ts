import fs from 'fs'
import path from 'path'
import shell from 'shelljs';
import users from './repos.json';

for (const [id, urls] of Object.entries(users)) {
  for (const url of urls) {
    const [username, repo] = url.replace('https://github.com/', '').split('/')
    const folder = `${id}_${username}`
    let target: string
    if (!fs.existsSync(target = path.resolve(__dirname, '../repos', folder, repo))) {
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
}
