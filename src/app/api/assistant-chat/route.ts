import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { documentType, question, context, history } = await req.json();
    
    // Tworzenie zaawansowanego prompta systemowego dla asystenta prawnego
    const systemPrompt = `Jesteś profesjonalnym asystentem prawnym specjalizującym się w polskim prawie. 
Twoje zadanie to udzielanie precyzyjnych, merytorycznych odpowiedzi na pytania dotyczące dokumentu typu "${documentType}".

Kontekst dokumentu użytkownika:
${context}

Zasady:
1. Odpowiadaj tylko na pytania związane z dokumentem i prawem
2. Prowadź użytkownika przez cały proces prawny
3. Cytuj konkretne przepisy prawne (artykuły, ustawy)
4. Informuj o terminach i konsekwencjach prawnych
5. Używaj prostego, zrozumiałego języka, ale precyzyjnego prawniczo
6. Jeśli pytanie wykracza poza twoje możliwości, sugeruj kontakt z prawnikiem
7. Zawsze zaznaczaj, że nie jest to formalna porada prawna`;

    // Przygotowanie historii konwersacji w formacie wymaganym przez OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg: {role: string, content: string}) => ({ 
        role: msg.role as "user" | "assistant" | "system", 
        content: msg.content 
      })),
      { role: "user", content: question }
    ];

    console.log('Wysyłam zapytanie do asystenta dla dokumentu:', documentType);
    
    // Wywołanie API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.2, // Niska temperatura dla bardziej faktograficznych odpowiedzi
    });

    console.log('Odpowiedź asystenta wygenerowana pomyślnie');
    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
    
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Nie udało się uzyskać odpowiedzi: ' + (error.message || 'Nieznany błąd') }, 
      { status: 500 }
    );
  }
} 