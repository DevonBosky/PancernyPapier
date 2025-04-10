import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicjalizacja klienta OpenAI
// Klucz API zostanie automatycznie odczytany ze zmiennej środowiskowej OPENAI_API_KEY
// Upewnij się, że plik .env.local istnieje i zawiera OPENAI_API_KEY=twój_klucz
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zaktualizowany interfejs dla danych wejściowych z textarea
interface GenerateRequestBody {
  documentType: DocumentType; // Używamy zdefiniowanego typu dla większego bezpieczeństwa
  detailsText: string;
  is_final?: boolean; // Opcjonalny parametr określający czy generujemy finalną wersję (po płatności)
}

// Typ DocumentType zdefiniowany tak jak w frontendzie (można go wydzielić do wspólnego pliku)
type DocumentType = 
  | 'wypowiedzenie_najmu' 
  | 'wypowiedzenie_pracy' 
  | 'odwolanie_mandat' 
  | 'reklamacja' 
  | 'wezwanie_do_zaplaty';

// Mapowanie typów dokumentów na bardziej przyjazne nazwy dla AI (opcjonalne, ale może pomóc)
const documentTypeLabels: Record<DocumentType, string> = {
  wypowiedzenie_najmu: 'Wypowiedzenie umowy najmu przez najemcę',
  wypowiedzenie_pracy: 'Wypowiedzenie umowy o pracę przez pracownika',
  odwolanie_mandat: 'Odwołanie od mandatu karnego',
  reklamacja: 'Reklamacja towaru lub usługi',
  wezwanie_do_zaplaty: 'Wezwanie do zapłaty',
};

export async function POST(request: Request) {
  // Sprawdzenie klucza API na starcie
  if (!process.env.OPENAI_API_KEY) {
    console.error('Brak klucza OPENAI_API_KEY w zmiennych środowiskowych.');
    return NextResponse.json({ error: 'Konfiguracja serwera niekompletna (brak klucza API)' }, { status: 500 });
  }

  try {
    const body: GenerateRequestBody = await request.json();
    // Odczytujemy detailsText zamiast details
    const { documentType, detailsText, is_final = false } = body;

    // Podstawowa walidacja
    if (!documentType || !detailsText || detailsText.trim().length === 0) {
      return NextResponse.json({ error: 'Nieprawidłowe dane wejściowe: brak typu dokumentu lub szczegółów.' }, { status: 400 });
    }

    console.log('Otrzymano żądanie generowania dla:', documentType, is_final ? '(wersja finalna)' : '(wersja wstępna)');
    // console.log('Szczegóły (tekst):', detailsText); // Opcjonalnie logowanie

    // --- Wywołanie API OpenAI --- 

    // Różne prompty dla wersji wstępnej i finalnej
    let systemPrompt = '';
    let userPrompt = '';
    
    if (is_final) {
      // Prompt dla wersji finalnej - bez placeholderów/didaskaliów
      systemPrompt = `Jesteś pomocnym asystentem specjalizującym się w generowaniu finalnych wersji polskich dokumentów prawnych i administracyjnych. Odpowiadaj wyłącznie treścią dokumentu, bez dodatkowych komentarzy, wstępów czy pożegnań. Używaj formalnego języka polskiego. Dbaj o poprawną strukturę dokumentu, uwzględniając datę, miejscowość, dane stron, treść główną i podpis. WAŻNE: Nie używaj placeholderów jak [Data], [Miejsce], [Twoje dane] - zamiast tego wstaw rzeczywiste dane z informacji podanych przez użytkownika. Jeśli jakiejś informacji brakuje, użyj domyślnych wartości, które brzmią realistycznie (np. dzisiejsza data, 'Warszawa' jako miejscowość, itp.).`;
      
      userPrompt = `Wygeneruj FINALNĄ wersję dokumentu: "${documentTypeLabels[documentType]}" zawierającą WSZYSTKIE potrzebne elementy bez placeholderów/didaskaliów. Użyj następujących informacji dostarczonych przez użytkownika: \n\n${detailsText}\n\nNie używaj placeholderów jak [Miejsce na dane] - zamiast tego użyj konkretnych danych z informacji podanych przez użytkownika lub wstaw realistyczne domyślne dane.`;
    } else {
      // Prompt dla wersji wstępnej - z placeholderami/didaskaliami
      systemPrompt = `Jesteś pomocnym asystentem specjalizującym się w generowaniu wstępnych wersji roboczych popularnych polskich dokumentów prawnych i administracyjnych. Odpowiadaj wyłącznie treścią dokumentu, bez dodatkowych komentarzy, wstępów czy pożegnań. Używaj formalnego języka polskiego. Dbaj o poprawną strukturę dokumentu, uwzględniając miejsce na datę, miejscowość, dane stron, treść główną i podpis. WAŻNE: Używaj placeholderów w nawiasach kwadratowych jak [Data], [Miejsce], [Twoje dane] zamiast konkretnych danych, aby zachęcić użytkownika do zakupu pełnej wersji.`;
      
      userPrompt = `Wygeneruj WSTĘPNĄ ROBOCZĄ wersję dokumentu: "${documentTypeLabels[documentType]}". W tej wersji używaj placeholderów/didaskaliów w nawiasach kwadratowych dla wszystkich ważnych informacji (np. [Data], [Miejsce], [Twoje dane], [Podpis]), aby użytkownik zrozumiał, że to tylko wersja demonstracyjna i potrzebuje kupić pełną wersję, aby uzyskać kompletny dokument. Bazuj na następujących informacjach od użytkownika, ale NIE wypełniaj dokumentu konkretnymi danymi: \n\n${detailsText}`;
    }

    console.log('Rozpoczynanie wywołania API OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7, // Można dostosować kreatywność
      // max_tokens: 1500, // Można ustawić limit tokenów, jeśli potrzebne
    });
    
    console.log('Otrzymano odpowiedź od API OpenAI.');
    const generatedDraft = completion.choices[0]?.message?.content;

    if (!generatedDraft) {
      throw new Error('Nie udało się wygenerować treści dokumentu przez API OpenAI.');
    }

    // --- Koniec wywołania API OpenAI ---

    return NextResponse.json({ draft: generatedDraft.trim() });

  } catch (error: any) {
    console.error('Błąd w API /api/generate:', error);
    let errorMessage = 'Wystąpił wewnętrzny błąd serwera podczas generowania dokumentu.';
    let statusCode = 500;

    if (error instanceof SyntaxError) {
      errorMessage = 'Nieprawidłowy format danych JSON.';
      statusCode = 400;
    } else if (error.response) { // Błąd odpowiedzi z API OpenAI
      console.error('Błąd API OpenAI (status):', error.response.status);
      console.error('Błąd API OpenAI (dane):', error.response.data);
      errorMessage = `Błąd komunikacji z usługą AI: ${error.response.data?.error?.message || error.message}`;
      statusCode = error.response.status || 500;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Nie można połączyć się z usługą AI.';
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('OPENAI_API_KEY')) { // Dodatkowe sprawdzenie dla braku klucza
        errorMessage = 'Konfiguracja serwera niekompletna (problem z kluczem API).';
        statusCode = 500;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 