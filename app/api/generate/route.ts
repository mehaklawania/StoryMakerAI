import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_AI_KEY) {
  throw new Error('Missing GOOGLE_AI_KEY environment variable')
}

const genai = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY)
const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function POST(request: Request) {
  try {
    const { prompt, mood, length, style, genre } = await request.json()

    const storyPrompt = `Write a ${mood.toLowerCase()} story in ${style.toLowerCase()} style. 
      It should be a ${genre.toLowerCase()} genre and approximately ${length.toLowerCase()}.
      Additional details: ${prompt}`

    const result = await model.generateContent(storyPrompt)
    const response = await result.response
    const text = response.text()

    return Response.json({ story: text })
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Failed to generate story' }, { status: 500 })
  }
} 