import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const headers = {
  sessionid: process.env.TWS_SESSIONID as string,
  token: process.env.TWS_TOKEN as string,
}

const quizzes: [string, number, number][] = [
  ['01-markdown', 1679, 357],
  ['02-html', 1678, 366],
  ['02-css', 1687, 374],
  ['02-html-css', 1686, 373],
  ['03-tdd', 1758, 5],
  ['04-tasking', 1753, 3],
  ['04-pos', 1754, 4],
]

const REPO_BLACKLIST = [
  'https://github.com/BlueSkylover/html_homework',
  'https://github.com/carefreeMa/Markdown-Git',
  'https://github.com/Evidence999/Markdown',
  'https://github.com/mahuanfy/CulturalCourse',
  'https://github.com/niniaibu/Training_Camp',
  'https://github.com/Snailclimb/JavaGuide',
  'https://github.com/XiaoRr/XiaoRr',
  'https://github.com/yuzhongyangwang/taxi',
]

async function main() {
  const response = await fetch(`https://school.thoughtworks.cn/learn/program-center/api/myStudents/programs/118`, { headers })
  const students = await response.json() as any[]
  const ids = students.map(x => x.student.id)
  for (const [title, assignment, quiz] of quizzes) {
    const base = path.resolve(__dirname, `../answers/pre/${title}`)
    fs.mkdirSync(base, { recursive: true })
    for (const id of ids) {
      try {
        console.log(`Fetching answer of user ${id}`)
        const response = await fetch(
          `https://school.thoughtworks.cn/learn/program-center/api/v2/students/${id}/assignments/${assignment}/quizzes/${quiz}`,
          { headers },
        )
        const { userAnswer: answer } = await response.json()
        if (answer && answer.length > 0) {
          fs.writeFileSync(
            path.resolve(base, `${id}.md`), answer, { encoding: 'utf-8' }
          )
          let res: RegExpExecArray | null = null
          if (res = /https:\/\/github.com\/.*?\/[\w\-]+/.exec(answer)) {
            const [url] = res
            const reposJsonPath = path.resolve(__dirname, `./repos.json`)
            const reposJson = fs.readFileSync(reposJsonPath, { encoding: 'utf-8' })
            const repos = JSON.parse(reposJson)
            if (!repos[id]) {
              repos[id] = [] as string[]
            }
            const urls: string[] = repos[id]
            if (urls.includes(url) || REPO_BLACKLIST.includes(url)) { continue }
            urls.push(url)
            const updatedReposJson = JSON.stringify(repos, undefined, 2)
            fs.writeFileSync(reposJsonPath, updatedReposJson, { encoding: 'utf-8' })
          }
        }
      } catch (e) {
        console.error(`Failed to fetch answer for user ${id}`)
        throw e
      }
    }
  }
  
}

main()
