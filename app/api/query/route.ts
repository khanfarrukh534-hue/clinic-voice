import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    
        // Hardcoded data for demo (replace with Sheet fetch later)
       const sheetId = process.env.GOOGLE_SHEET_ID;
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Sheet1`,
      { cache: 'no-store' }  // Prevents caching issues
    );
    
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    
        const data = rows.slice(1).map((row: any) => {
      const getValue = (cell: any) => {
        if (!cell) return '';
        // If cell has 'f' property, use formatted value, else use 'v'
        return cell.f !== undefined ? cell.f : (cell.v || '');
      };
      
      return {
        name: getValue(row.c[0]),
        phone: getValue(row.c[1]),
        date: getValue(row.c[2]),
        time: getValue(row.c[3]),
        treatment: getValue(row.c[4]),
        status: getValue(row.c[5]),
        notes: getValue(row.c[6]),
      };
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a clinic assistant. You have access to patient appointment data. 
          Answer the doctor's question based ONLY on this data: ${JSON.stringify(data)}.
          Be concise and friendly. If asking about today, use date 2026-06-15.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
    });

    const answer = completion.choices[0]?.message?.content || 'Sorry, I could not understand.';
    
    return NextResponse.json({ answer, data });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}