'use client'; // Potrzebne dla useState

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Dodano import dla logo
// Usunięto importy file-saver i html-to-docx z góry pliku
// import { saveAs } from 'file-saver'; 
// const htmlToDocx = require('html-to-docx'); 

// Definicje typów dokumentów i ich pól (można przenieść do osobnego pliku później)
type DocumentType = 
  | 'wypowiedzenie_najmu' 
  | 'wypowiedzenie_pracy' 
  | 'odwolanie_mandat' 
  | 'reklamacja' 
  | 'wezwanie_do_zaplaty';

const documentOptions: { value: DocumentType; label: string }[] = [
  { value: 'wypowiedzenie_najmu', label: 'Wypowiedzenie umowy najmu (przez najemcę)' },
  { value: 'wypowiedzenie_pracy', label: 'Wypowiedzenie umowy o pracę (przez pracownika)' },
  { value: 'odwolanie_mandat', label: 'Odwołanie od mandatu karnego' },
  { value: 'reklamacja', label: 'Reklamacja towaru/usługi' },
  { value: 'wezwanie_do_zaplaty', label: 'Wezwanie do zapłaty' },
];

// Definicje tekstów pomocniczych (placeholderów) dla textarea
const documentPlaceholders: Record<DocumentType, string> = {
  wypowiedzenie_najmu: "Podaj szczegóły dotyczące wypowiedzenia umowy najmu:\n- Twoje dane (imię, nazwisko, adres)\n- Dane wynajmującego\n- Adres wynajmowanego lokalu\n- Data zawarcia umowy najmu\n- Okres wypowiedzenia (zgodny z umową)\n- Data sporządzenia pisma",
  wypowiedzenie_pracy: "Podaj szczegóły dotyczące wypowiedzenia umowy o pracę:\n- Twoje dane (imię, nazwisko, adres)\n- Dane pracodawcy (nazwa, adres)\n- Data zawarcia umowy o pracę\n- Stanowisko\n- Okres wypowiedzenia (zgodny z Kodeksem Pracy lub umową)\n- Data sporządzenia pisma",
  odwolanie_mandat: "Podaj szczegóły dotyczące odwołania od mandatu:\n- Twoje dane (imię, nazwisko, adres, PESEL)\n- Numer i seria mandatu karnego\n- Data i miejsce nałożenia mandatu\n- Organ, który nałożył mandat\n- Opis zdarzenia\n- Uzasadnienie odwołania (dlaczego uważasz, że mandat jest niesłuszny)",
  reklamacja: "Podaj szczegóły dotyczące reklamacji towaru/usługi:\n- Twoje dane (imię, nazwisko, adres)\n- Dane sprzedawcy/usługodawcy\n- Data zakupu/zawarcia umowy\n- Nazwa towaru/usługi\n- Opis wady lub niezgodności z umową\n- Data stwierdzenia wady\n- Twoje żądanie (naprawa, wymiana, obniżenie ceny, odstąpienie od umowy)",
  wezwanie_do_zaplaty: "Podaj szczegóły dotyczące wezwania do zapłaty:\n- Twoje dane (wierzyciela: imię, nazwisko/nazwa firmy, adres)\n- Dane dłużnika (imię, nazwisko/nazwa firmy, adres)\n- Podstawa roszczenia (np. numer faktury, umowy, data powstania zobowiązania)\n- Kwota zadłużenia (liczbowo i słownie)\n- Termin zapłaty (podaj konkretną datę, np. 7 dni od otrzymania wezwania)\n- Numer konta bankowego do wpłaty",
};

// TODO: Zdefiniować pola dla każdego typu dokumentu

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | ''>('');
  const [detailsInput, setDetailsInput] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [finalContent, setFinalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as DocumentType | '';
    setSelectedDocument(value);
    setDetailsInput('');
    setPreviewContent('');
    setFinalContent('');
    setIsPaid(false);
    setIsProcessingPayment(false);
    setAgreedToTerms(false);
    setPaymentMessage('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetailsInput(event.target.value);
  };

  const handleGeneratePreview = async () => {
    if (!agreedToTerms) {
      alert("Musisz zaakceptować regulamin.");
      return;
    }
    if (!detailsInput.trim()) {
      alert("Proszę wprowadzić wymagane szczegóły.");
      return;
    }

    setIsLoading(true);
    setPreviewContent('');
    setFinalContent('');
    setIsPaid(false);
    setIsProcessingPayment(false);
    setPaymentMessage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentType: selectedDocument, detailsText: detailsInput }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Błąd podczas generowania podglądu');
      }

      const data = await response.json();
      if (data.draft) {
        setPreviewContent(data.draft);
      } else {
        throw new Error('Otrzymano nieprawidłową odpowiedź z serwera.');
      }

    } catch (error: any) {
      console.error(error);
      alert(`Wystąpił błąd: ${error.message || 'Spróbuj ponownie.'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSimulatedPayment = () => {
    if (isProcessingPayment || !previewContent) return;
    
    // Symulacja procesu płatności dla MVP (w rzeczywistej aplikacji użylibyśmy Stripe)
    setIsProcessingPayment(true);
    setPaymentMessage('Przetwarzanie płatności...');
    
    // Symulacja opóźnienia i sukcesu płatności (w rzeczywistości wywołalibyśmy API Stripe)
    setTimeout(async () => {
      try {
        // W pełnej implementacji tutaj byłoby wywołanie API /api/generate z parametrem is_final=true
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentType: selectedDocument,
            detailsText: detailsInput,
            is_final: true,  // To oznacza, że generujemy wersję finalną (bez placeholderów)
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Wystąpił błąd podczas generowania dokumentu.');
        }
        
        // Zapisujemy treść dokumentu finalnego (bez placeholderów)
        setFinalContent(data.draft);
        setIsPaid(true);
        setPaymentMessage('Płatność zaakceptowana! Pobierz edytowalną wersję dokumentu poniżej.');
      } catch (error: unknown) {
        console.error('Błąd podczas przetwarzania płatności:', error);
        setPaymentMessage(`Błąd: ${(error as Error).message || 'Wystąpił nieoczekiwany błąd'}`);
        // W rzeczywistej aplikacji zaimplementowalibyśmy lepszą obsługę błędów
      }
    }, 2000);  // Symulacja 2-sekundowego opóźnienia dla UX
  };

  // Funkcja pobierania jako TXT z dynamicznym importem saveAs
  const handleDownloadTxt = async () => {
    if (!finalContent) return;
    const { saveAs } = await import('file-saver'); // Dynamiczny import
    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${selectedDocument || 'dokument'}.txt`);
  };

  // Dodanie stylu dla rozmytych linii
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .blur-effect {
        filter: blur(3px);
        user-select: none;
      }
      .preview-line {
        line-height: 1.5;
        margin-bottom: 0.25rem;
      }
      .preview-content {
        padding-bottom: 2rem;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex flex-col items-center mb-10">
         <div className="relative mb-4 shadow-lg rounded-full p-2 bg-white">
           <Image 
              src="/logo.png" 
              alt="Pancerny Papier Logo"
              width={120}
              height={120}
              className="rounded-full"
              priority
           />
           <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
             MVP
           </div>
         </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">PANCERNY PAPIER</h1>
        <p className="text-lg text-gray-600 mt-2 font-light">Profesjonalne dokumenty prawne w kilka minut</p>
      </div>
      
      {paymentMessage && (
         <div className={`w-full max-w-3xl mb-6 p-4 rounded-lg text-sm text-center shadow-md transition-all duration-300 ${isProcessingPayment ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
           {paymentMessage}
         </div>
      )}

      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100">
        
        {!isPaid && (
          <section className="mb-8">
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
              1. Wybierz rodzaj dokumentu:
            </label>
            <select
              id="documentType"
              value={selectedDocument}
              onChange={handleDocumentChange}
              className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm text-gray-900 transition-all duration-200"
              disabled={isLoading || isProcessingPayment}
            >
              <option value="">-- Wybierz --</option>
              {documentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {selectedDocument && !isPaid && (
          <section className="mb-8">
             <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Wprowadź kluczowe informacje:</h2>
             <textarea
                id="detailsInput"
                name="detailsInput"
                rows={10} 
                value={detailsInput}
                onChange={handleInputChange}
                placeholder={documentPlaceholders[selectedDocument] || 'Wprowadź tutaj szczegóły...'}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-500 text-gray-900 bg-white disabled:bg-gray-50 transition-all duration-200"
                disabled={isLoading || isProcessingPayment}
              />
          </section>
        )}

        {selectedDocument && !previewContent && !isPaid && (
          <section className="mb-8">
            <div className="flex items-center mb-5 bg-gray-50 p-3 rounded-lg">
               <input
                 id="terms"
                 name="terms"
                 type="checkbox"
                 checked={agreedToTerms}
                 onChange={(e) => setAgreedToTerms(e.target.checked)}
                 className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                 disabled={isLoading || isProcessingPayment || !selectedDocument}
               />
               <label htmlFor="terms" className={`ml-3 block text-sm ${!selectedDocument ? 'text-gray-400' : 'text-gray-700'}`}>
                 Akceptuję <a href="/regulamin" target="_blank" rel="noopener noreferrer" className={`underline ${!selectedDocument ? 'text-blue-400' : 'text-blue-600 hover:text-blue-800'}`}>Regulamin</a> serwisu.
               </label>
            </div>
            <button
              onClick={handleGeneratePreview}
              disabled={!selectedDocument || !detailsInput.trim() || !agreedToTerms || isLoading || isProcessingPayment}
              className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generowanie...
                </span>
              ) : '3. Generuj Wstępną Wersję'}
            </button>
            <p className="mt-3 text-xs text-gray-500 text-center bg-gray-50 p-2 rounded-lg">
               Pamiętaj, że wygenerowany dokument to tylko wersja wstępna i wymaga weryfikacji. To nie jest porada prawna.
             </p>
          </section>
        )}

        {previewContent && !isPaid && (
          <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">4. Podgląd Wstępnej Wersji</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">DEMO</span>
              </h2>
            <div 
              className="relative p-5 border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] overflow-auto select-none shadow-inner" 
              style={{ userSelect: 'none' }}
            >
              <div className="whitespace-pre-wrap text-sm text-gray-700 opacity-70 preview-content">
                {previewContent.split('\n').map((line, index) => {
                  // Rozmywamy co trzecią linię i losowo wybrane linie zawierające ważne dane
                  const shouldBlur = index % 3 === 1 || 
                    (line.includes('[') && line.includes(']')) || 
                    line.match(/(kwot|zł|PLN|złot|adres|nazwisk|imię|imie|PESEL|NIP|telefon|email)/i);
                  
                  return (
                    <div 
                      key={index} 
                      className={`preview-line ${shouldBlur ? 'blur-effect' : ''}`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl sm:text-6xl text-gray-300 opacity-50 font-bold transform -rotate-12 select-none">
                  PODGLĄD
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center pb-4">
                <span className="text-blue-600 font-semibold text-sm px-4 py-1 bg-blue-50 rounded-full border border-blue-100 shadow-sm">
                  Pełna treść dostępna po zakupie
                </span>
              </div>
            </div>
          </section>
        )}

        {previewContent && !isPaid && (
          <section className="mb-8 text-center">
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-sm">
               <h3 className="text-lg font-semibold text-gray-800 mb-2">Odblokuj pełną wersję dokumentu</h3>
               <p className="text-sm text-gray-700 mb-3 px-4">
                 Po dokonaniu płatności otrzymasz <strong>finalną wersję dokumentu</strong> ze wszystkimi uzupełnionymi danymi, <strong>bez placeholderów</strong> i didaskaliów w nawiasach kwadratowych. Dokument będzie gotowy do użycia bez konieczności ręcznego zastępowania pól [tekst w nawiasach].
               </p>
               <p className="text-xs text-blue-700 font-medium">Oferujemy możliwość profesjonalnej konsultacji treści dokumentu z doświadczonym prawnikiem.</p>
             </div>
            <button
              onClick={handleSimulatedPayment}
              disabled={isProcessingPayment || isLoading}
              className="inline-flex justify-center py-3 px-8 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessingPayment ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Przetwarzanie...
                </span>
               ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Zapłać 8 PLN za Finalną Wersję
                </span>
               )} 
            </button>
          </section>
        )}
        
        {isPaid && finalContent && (
           <section>
             <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
               <span className="mr-2">5. Twoja Finalna Wersja Dokumentu</span>
               <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">PEŁNA WERSJA</span>
             </h2>
            <textarea
              id="finalDocumentArea"
              readOnly 
              value={finalContent}
              className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm min-h-[250px] text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
            />
             <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                 onClick={() => navigator.clipboard.writeText(finalContent)}
                 className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                 </svg>
                 Kopiuj do schowka
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Pobierz jako DOC
                </button>
             </div>
          </section>
        )}

      </div>

      <footer className="mt-12 text-center">
        <div className="flex justify-center space-x-5 mb-4">
          <a href="/regulamin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Regulamin</a>
          <a href="/polityka-prywatnosci" className="text-sm text-blue-600 hover:text-blue-800 underline">Polityka Prywatności</a>
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Pancerny Papier. Wszelkie prawa zastrzeżone.</p>
        <p className="mt-1 text-xs text-gray-500">Uwaga: Serwis generuje jedynie wstępne wersje dokumentów i nie stanowi porady prawnej.</p>
      </footer>
    </main>
  );
}
