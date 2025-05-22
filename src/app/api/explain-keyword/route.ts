import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    if (!keyword) {
      return NextResponse.json({ error: 'Keyword required' }, { status: 400 });
    }
    const prompt = `In no more than 20 words, explain the following keyword for a general audience. Only output the explanation, nothing else. Keyword: "${keyword}"`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // GPT-4.1
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 60,
        top_p: 0.95,
        stream: false,
        stop: null,
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return NextResponse.json({ error }, { status: 500 });
    }
    const data = await openaiRes.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ explanation: explanation || 'No explanation found.' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 