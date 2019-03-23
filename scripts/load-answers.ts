import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const headers = {
  sessionid: process.env.TWS_SESSIONID as string,
  token: process.env.TWS_TOKEN as string,
}

const quizzes = [
  ['01-markdown', 1679, 357] as [string, number, number],
  ['02-html', 1678, 366] as [string, number, number],
  ['02-css', 1687, 374] as [string, number, number],
  ['02-html-css', 1686, 373] as [string, number, number],
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
        if (answer.length > 0) {
          fs.writeFileSync(
            path.resolve(base, `${id}.md`), answer, { encoding: 'utf-8' }
          )
        }
      } catch (e) {
        console.error(`Failed to fetch answer for user ${id}`)
        throw e
      }
    }
  }
  
}

main()
