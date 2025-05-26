import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, context } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }
  if (!question) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 });
  }

  const formattingRules = `Answer the following questions clearly and professionally. Use proper formatting to enhance readability:\n\n- Break down large chunks of text into short paragraphs.\n- If listing items (e.g., steps, principles, categories), use numbered or bulleted lists.\n- Leave a blank line between paragraphs and list items.\n- Make sure each point is concise, begins with a bolded label if needed (e.g., Utility:), and avoids overwhelming blocks of text.\n- Use clear structure and avoid cramming everything into a single paragraph.`;
  const systemPrompt = (context ? `Context: ${context}\n` : '') + formattingRules + '\nYou are a helpful AI assistant.';
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'OpenAI error' }, { status: 500 });
    }
    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'No response from AI.';
    return NextResponse.json({ answer: aiMessage });
  } catch {
    return NextResponse.json({ error: 'Failed to contact OpenAI.' }, { status: 500 });
  }
} 