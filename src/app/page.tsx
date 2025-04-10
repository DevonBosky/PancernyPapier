'use client'; // Potrzebne dla useState

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Dodano import dla logo
import { useRouter } from 'next/navigation';
// Usunięto importy file-saver i html-to-docx z góry pliku
// import { saveAs } from 'file-saver'; 
// const htmlToDocx = require('html-to-docx'); 

// Definicje typów dokumentów i ich pól (można przenieść do osobnego pliku później)
type DocumentType = 
  | 'wypowiedzenie_najmu' 
  | 'wypowiedzenie_pracy' 
  | 'odwolanie_mandat' 
  | 'reklamacja' 
  | 'wezwanie_do_zaplaty'
  | 'odstapienie_od_umowy_konsument'
  | 'pelnomocnictwo_ogolne'
  | 'wniosek_zaswiadczenie'
  | 'umowa_pozyczki'
  | 'protokol_zdawczo_odbiorczy'
  | 'wypowiedzenie_pracodawca'
  | 'umowa_zlecenie'
  | 'umowa_o_dzielo'
  | 'porozumienie_o_splacie'
  | 'uchwala_wspolnikow_prosta';

const documentOptions: { value: DocumentType; label: string }[] = [
  { value: 'wypowiedzenie_najmu', label: 'Wypowiedzenie umowy najmu (przez najemcę)' },
  { value: 'wypowiedzenie_pracy', label: 'Wypowiedzenie umowy o pracę (przez pracownika)' },
  { value: 'odwolanie_mandat', label: 'Odwołanie od mandatu karnego' },
  { value: 'reklamacja', label: 'Reklamacja towaru/usługi' },
  { value: 'wezwanie_do_zaplaty', label: 'Wezwanie do zapłaty' },
  { value: 'odstapienie_od_umowy_konsument', label: 'Odstąpienie od umowy (konsument, na odległość/poza lokalem)' },
  { value: 'pelnomocnictwo_ogolne', label: 'Pełnomocnictwo ogólne' },
  { value: 'wniosek_zaswiadczenie', label: 'Wniosek o wydanie zaświadczenia' },
  { value: 'umowa_pozyczki', label: 'Umowa pożyczki (między osobami fizycznymi)' },
  { value: 'protokol_zdawczo_odbiorczy', label: 'Protokół zdawczo-odbiorczy lokalu' },
  { value: 'wypowiedzenie_pracodawca', label: 'Wypowiedzenie umowy o pracę (przez pracodawcę)' },
  { value: 'umowa_zlecenie', label: 'Umowa zlecenie (prosty wzór)' },
  { value: 'umowa_o_dzielo', label: 'Umowa o dzieło (prosty wzór)' },
  { value: 'porozumienie_o_splacie', label: 'Porozumienie o spłacie długu w ratach' },
  { value: 'uchwala_wspolnikow_prosta', label: 'Prosta uchwała wspólników Sp. z o.o.' },
];

// Definicje tekstów pomocniczych (placeholderów) dla textarea
const documentPlaceholders: Record<DocumentType, string> = {
  wypowiedzenie_najmu: "Podaj szczegóły dotyczące wypowiedzenia umowy najmu:\n- Twoje dane (imię, nazwisko, adres)\n- Dane wynajmującego\n- Adres wynajmowanego lokalu\n- Data zawarcia umowy najmu\n- Okres wypowiedzenia (zgodny z umową)\n- Data sporządzenia pisma",
  wypowiedzenie_pracy: "Podaj szczegóły dotyczące wypowiedzenia umowy o pracę:\n- Twoje dane (imię, nazwisko, adres)\n- Dane pracodawcy (nazwa, adres)\n- Data zawarcia umowy o pracę\n- Stanowisko\n- Okres wypowiedzenia (zgodny z Kodeksem Pracy lub umową)\n- Data sporządzenia pisma",
  odwolanie_mandat: "Podaj szczegóły dotyczące odwołania od mandatu:\n- Twoje dane (imię, nazwisko, adres, PESEL)\n- Numer i seria mandatu karnego\n- Data i miejsce nałożenia mandatu\n- Organ, który nałożył mandat\n- Opis zdarzenia\n- Uzasadnienie odwołania (dlaczego uważasz, że mandat jest niesłuszny)",
  reklamacja: "Podaj szczegóły dotyczące reklamacji towaru/usługi:\n- Twoje dane (imię, nazwisko, adres)\n- Dane sprzedawcy/usługodawcy\n- Data zakupu/zawarcia umowy\n- Nazwa towaru/usługi\n- Opis wady lub niezgodności z umową\n- Data stwierdzenia wady\n- Twoje żądanie (naprawa, wymiana, obniżenie ceny, odstąpienie od umowy)",
  wezwanie_do_zaplaty: "Podaj szczegóły dotyczące wezwania do zapłaty:\n- Twoje dane (wierzyciela: imię, nazwisko/nazwa firmy, adres)\n- Dane dłużnika (imię, nazwisko/nazwa firmy, adres)\n- Podstawa roszczenia (np. numer faktury, umowy, data powstania zobowiązania)\n- Kwota zadłużenia (liczbowo i słownie)\n- Termin zapłaty (podaj konkretną datę, np. 7 dni od otrzymania wezwania)\n- Numer konta bankowego do wpłaty",
  odstapienie_od_umowy_konsument: "Podaj szczegóły dotyczące odstąpienia od umowy:\n- Twoje dane (imię, nazwisko, adres)\n- Dane sprzedawcy/usługodawcy\n- Data zawarcia umowy / Data otrzymania towaru\n- Numer zamówienia / Opis towaru/usługi\n- Data sporządzenia pisma\n- [Opcjonalnie] Numer konta do zwrotu środków",
  pelnomocnictwo_ogolne: "Podaj szczegóły dotyczące pełnomocnictwa:\n- Dane Mocodawcy (imię, nazwisko, adres, PESEL/nr dowodu)\n- Dane Pełnomocnika (imię, nazwisko, adres, PESEL/nr dowodu)\n- Data sporządzenia pisma\n- Miejscowość sporządzenia pisma",
  wniosek_zaswiadczenie: "Podaj szczegóły dotyczące wniosku o zaświadczenie:\n- Twoje dane (imię, nazwisko/nazwa firmy, adres, NIP/PESEL)\n- Dane urzędu/instytucji, do której składasz wniosek\n- Rodzaj zaświadczenia (np. o niezaleganiu w podatkach, o niezaleganiu ze składkami ZUS)\n- Cel wydania zaświadczenia (np. do przetargu, do banku)\n- Data sporządzenia pisma",
  umowa_pozyczki: "Podaj szczegóły dotyczące umowy pożyczki:\n- Dane Pożyczkodawcy (imię, nazwisko, adres, PESEL/nr dowodu)\n- Dane Pożyczkobiorcy (imię, nazwisko, adres, PESEL/nr dowodu)\n- Kwota pożyczki (liczbowo i słownie)\n- Waluta pożyczki\n- Termin zwrotu pożyczki\n- [Opcjonalnie] Oprocentowanie (jeśli dotyczy)\n- [Opcjonalnie] Sposób przekazania kwoty (gotówka/przelew)\n- Data i miejsce zawarcia umowy",
  protokol_zdawczo_odbiorczy: "Podaj szczegóły dotyczące protokołu zdawczo-odbiorczego lokalu:\n- Dane Zdającego (np. Wynajmujący, Sprzedający)\n- Dane Odbierającego (np. Najemca, Kupujący)\n- Adres lokalu/nieruchomości\n- Data przekazania\n- Stan liczników (woda zimna, woda ciepła, prąd, gaz)\n- Opis stanu technicznego lokalu i wyposażenia (np. ściany, podłogi, okna, meble, AGD)\n- Uwagi stron\n- Liczba przekazanych kluczy",
  wypowiedzenie_pracodawca: "Podaj szczegóły dotyczące wypowiedzenia umowy przez pracodawcę:\n- Dane pracodawcy (nazwa, adres, NIP, REGON)\n- Dane pracownika (imię, nazwisko, adres)\n- Data zawarcia umowy o pracę\n- Rodzaj umowy\n- Stanowisko pracownika\n- Okres wypowiedzenia (zgodny z Kodeksem Pracy lub umową)\n- Przyczyna wypowiedzenia (wymagane przy umowach na czas nieokreślony)\n- Pouczenie o prawie odwołania do sądu pracy\n- Data sporządzenia pisma",
  umowa_zlecenie: "Podaj szczegóły dotyczące umowy zlecenia:\n- Dane Zleceniodawcy (imię, nazwisko/nazwa firmy, adres, NIP/PESEL)\n- Dane Zleceniobiorcy (imię, nazwisko, adres, PESEL)\n- Przedmiot zlecenia (opis czynności)\n- Data rozpoczęcia i zakończenia zlecenia (lub okres obowiązywania)\n- Wynagrodzenie (kwota brutto/netto, sposób płatności: godzinowo/za całość)\n- Termin płatności wynagrodzenia\n- Oświadczenia Zleceniobiorcy (np. dotyczące ZUS)\n- Data i miejsce zawarcia umowy",
  umowa_o_dzielo: "Podaj szczegóły dotyczące umowy o dzieło:\n- Dane Zamawiającego (imię, nazwisko/nazwa firmy, adres, NIP/PESEL)\n- Dane Wykonawcy (imię, nazwisko, adres, PESEL)\n- Przedmiot dzieła (dokładny opis rezultatu)\n- Termin wykonania dzieła\n- Wynagrodzenie za dzieło (kwota brutto/netto)\n- Termin i sposób płatności wynagrodzenia\n- Sposób przekazania dzieła\n- [Opcjonalnie] Kwestia praw autorskich (jeśli dotyczy)\n- Data i miejsce zawarcia umowy",
  porozumienie_o_splacie: "Podaj szczegóły dotyczące porozumienia o spłacie zadłużenia:\n- Dane Wierzyciela\n- Dane Dłużnika\n- Podstawa zadłużenia (np. umowa, faktura, wezwanie do zapłaty)\n- Całkowita kwota zadłużenia na dzień zawarcia porozumienia\n- Uznanie długu przez Dłużnika\n- Harmonogram spłaty (liczba rat, wysokość rat, terminy płatności poszczególnych rat)\n- Numer konta bankowego Wierzyciela do wpłat\n- Skutki niedotrzymania warunków porozumienia\n- Data i miejsce zawarcia porozumienia",
  uchwala_wspolnikow_prosta: "Podaj szczegóły dotyczące uchwały wspólników Sp. z o.o.:\n- Nazwa spółki, adres siedziby, numer KRS\n- Data i miejsce podjęcia uchwały\n- Numer uchwały\n- Treść uchwały (np. Zatwierdza się sprawozdanie finansowe za rok obrotowy... / Powołuje się Pana/Panią X na stanowisko Członka Zarządu / Odwołuje się Pana/Panią Y ze stanowiska Członka Zarządu)\n- Wynik głosowania (liczba głosów za, przeciw, wstrzymujących się)\n- Podpisy wspólników obecnych na zgromadzeniu (lub protokołanta, jeśli dotyczy)",
};

// TODO: Zdefiniować pola dla każdego typu dokumentu

export default function Home() {
  const router = useRouter();
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

  // Funkcja obsługi konsultacji z prawnikiem
  const handleConsultationClick = () => {
    // Przekierowanie do podstrony konsultacji
    router.push('/konsultacje');
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
             <div className="relative">
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
               <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                 <p className="font-medium mb-1">Pamiętaj, aby wprowadzić następujące informacje:</p>
                 <p>{documentPlaceholders[selectedDocument]}</p>
               </div>
             </div>
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
              ) : 'Generuj Wstępną Wersję'}
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
                 Po dokonaniu płatności otrzymasz <strong>finalną wersję dokumentu</strong> ze wszystkimi uzupełnionymi danymi. Dokument będzie gotowy do użycia bez konieczności ręcznego zastępowania pól.
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
                <button
                  onClick={handleConsultationClick}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Umów konsultację z prawnikiem
                </button>
             </div>
          </section>
        )}

      </div>

      <footer className="mt-12 text-center">
        <div className="flex justify-center space-x-5 mb-4">
          <a href="/regulamin" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">Regulamin</a>
          <a href="/konsultacje" className="text-sm text-blue-600 hover:text-blue-800 underline">Konsultacje</a>
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Pancerny Papier. Wszelkie prawa zastrzeżone.</p>
        <p className="mt-1 text-xs text-gray-500">Uwaga: Serwis generuje jedynie wstępne wersje dokumentów i nie stanowi porady prawnej.</p>
      </footer>
    </main>
  );
}
