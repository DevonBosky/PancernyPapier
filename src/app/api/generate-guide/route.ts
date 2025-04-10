import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { documentType, detailsText } = await req.json();
    
    // Tworzenie zoptymalizowanego prompta dla LLM
    const prompt = `Przygotuj profesjonalny, szczegółowy informator prawny dotyczący dokumentu typu "${documentType}". 
  
Dane kontekstowe: ${detailsText}

Informator powinien zawierać:
1. Podstawę prawną dokumentu (konkretne artykuły i ustawy)
2. Szczegółowy opis procesu krok po kroku (co należy zrobić przed i po sporządzeniu)
3. Obowiązujące terminy (z wyraźnym oznaczeniem)
4. Potencjalne ryzyka prawne i jak ich uniknąć
5. Konsekwencje nieterminowego złożenia/procedowania
6. Najczęstsze pytania i szczegółowe odpowiedzi
7. Przykłady z orzecznictwa (jeśli istotne)

Formatowanie:
- Używaj nagłówków i podpunktów
- Wyróżnij ważne terminy pogrubieniem
- Używaj profesjonalnego, ale zrozumiałego języka
- Podziel tekst na czytelne sekcje`;

    // Wywołanie API OpenAI
    console.log('Rozpoczynam generowanie przewodnika dla:', documentType);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Jesteś ekspertem prawnym specjalizującym się w polskim prawie. Twój zadaniem jest tworzenie informatywnych i praktycznych przewodników prawnych." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Niższa temperatura dla bardziej precyzyjnych odpowiedzi
      max_tokens: 2000,
    });

    console.log('Przewodnik wygenerowany pomyślnie');
    return NextResponse.json({ 
      guide: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Nie udało się wygenerować poradnika: ' + (error.message || 'Nieznany błąd') }, 
      { status: 500 }
    );
  }
} 