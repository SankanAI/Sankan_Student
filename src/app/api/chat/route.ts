import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import { VectorStore } from '@/lib/utils/vector-store';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const vectorStore = new VectorStore();

export async function POST(request: Request) {
  try {
    const { queryEmbedding, query } = await request.json();

    const similarDocs = await vectorStore.findSimilarDocuments(queryEmbedding);
    const context = similarDocs.map(doc => doc.text).join('\n\n');

    const prompt = `You are an AI assistant helping users with questions about educational applications. Based on the following context, please provide a clear and concise answer to the question. If the information cannot be found in the context, please say so.

Context:
${context}

Question: ${query}

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      max_tokens: 1024,
    });

    return NextResponse.json({ 
      answer: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}