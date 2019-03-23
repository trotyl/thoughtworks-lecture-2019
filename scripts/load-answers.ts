import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const BASE_URL = `https://school.thoughtworks.cn/learn/program-center/api`

const headers = {
  sessionid: process.env.TWS_SESSIONID as string,
  token: process.env.TWS_TOKEN as string,
}

const programs = [118, 144]

const REPO_BLACKLIST = [
  'https://github.com/BlueSkylover/html_homework',
  'https://github.com/carefreeMa/Markdown-Git',
  'https://github.com/Evidence999/Markdown',
  'https://github.com/Evidence999/take-out-food-2018-11-26-7-35-16-442',
  'https://github.com/mahuanfy/CulturalCourse',
  'https://github.com/niniaibu/Training_Camp',
  'https://github.com/Snailclimb/JavaGuide',
  'https://github.com/XiaoRr/XiaoRr',
  'https://github.com/yuzhongyangwang/taxi',
]

interface Student {
  mobilePhone: string
  name: string
  groups: never[]
  id: number
  email: string
  username: string
}

interface Quiz {
  id: number
  quizId: number
  assignmentId: number
  createTime: never
  creatorId: number
  orderNumber: number
}

interface Assignment {
  id: number
  taskId: number
  type: 'SUBJECTIVE_QUIZ'
  title: string
  createTime: string
  creatorId: number
  orderNumber: number
  visible: boolean
  selectedQuizzes: Quiz[]
  title_zh_TW: string
}

interface Task {
  id: number
  programId: number
  paperId: number
  topicId: number
  orderNumber: number
  title: string
  content: string
  deadLine: string
  createTime: never
  visible: boolean
  type: string
  assignments: Assignment[]
}

interface AssignmentWrapper {
  task: Task
  assignment: Assignment
  topic: never
  situation: never
}

interface Answer {
  id: number
  description: string
  type?: string
  answer?: string
  choices?: { choice: string }[]
  isCorrect?: boolean
  userAnswer: string
  userAnswerZipUrl: string | null
  answerBranch?: string | null
}

async function main() {
  const availableRepos: [number, string][] = []
  
  for (const programId of programs) {
    const [students, assignmentWrappers]: [Student[], AssignmentWrapper[]] = await Promise.all([
      fetch(`${BASE_URL}/programs/${programId}/students`, { headers }).then(res => res.json()),
      fetch(`${BASE_URL}/v2/myStudents/programs/${programId}/students/assignments`, { headers }).then(res => res.json()),
    ])

    const assignments = assignmentWrappers.map(x => x.assignment)

    for (const student of students) {
      for (const assignment of assignments) {
        const answers: string[] = []
        for (const quiz of assignment.selectedQuizzes) {
          const answer: Answer = await fetch(`${BASE_URL}/v2/students/${student.id}/assignments/${assignment.id}/quizzes/${quiz.quizId}`, { headers }).then(res => res.json())
          let res: RegExpExecArray | null = null
          if (answer.choices) {
            answers.push(`${answer.description}
回答：${answer.userAnswer ? answer.choices[parseInt(answer.userAnswer!, 10)].choice : '尚未回答'}
正确答案：${answer.choices[parseInt(answer.answer!, 10)].choice}
`)
          } else if (answer.answerBranch != null && (res = /https:\/\/github.com\/.*?\/[\w\-]+/.exec(answer.userAnswer))) {
            const [repoUrl] = res
            availableRepos.push([student.id, repoUrl])
          } else if (answer.userAnswerZipUrl) {
            answers.push(`Zip: ${answer.userAnswerZipUrl}`)
          } else if (answer.userAnswer) {
            answers.push(answer.userAnswer)

            let res: RegExpExecArray | null = null
            if (res = /https:\/\/github.com\/.*?\/[\w\-]+/.exec(answer.userAnswer)) {
              const [repoUrl] = res
              availableRepos.push([student.id, repoUrl])
            }
          }
        }

        if (answers.length > 0) {
          const fileContent = answers.join('\n')
          const basePath = path.resolve(__dirname, `../answers/${programId}/${assignment.id}_${assignment.title}`)
          fs.mkdirSync(basePath, { recursive: true })
          fs.writeFileSync(path.resolve(basePath, `${student.id}.md`), fileContent, { encoding: 'utf-8' })
        }
      }
    }
  }

  const reposJsonPath = path.resolve(__dirname, `./repos.json`)
  const reposJson = fs.readFileSync(reposJsonPath, { encoding: 'utf-8' })
  const repos = JSON.parse(reposJson)

  for (const [studentId, repoUrl] of availableRepos) {
    if (!repos[studentId]) {
      repos[studentId] = [] as string[]
    }
    const urls: string[] = repos[studentId]
    if (!urls.includes(repoUrl) && !REPO_BLACKLIST.includes(repoUrl)) {
      urls.push(repoUrl)
    }
  }
  
  const updatedReposJson = JSON.stringify(repos, undefined, 2)
  fs.writeFileSync(reposJsonPath, updatedReposJson, { encoding: 'utf-8' })
}

main()
