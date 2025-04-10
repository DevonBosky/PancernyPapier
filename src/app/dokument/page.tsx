'use client'; // Potrzebne dla useState i useEffect

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { marked } from 'marked';

// Obsługa dynamicznego importu
import dynamic from 'next/dynamic';

export default function DocumentPage() {
  const router = useRouter();
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<string>('basic');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showAssistant, setShowAssistant] = useState<boolean>(false);
  const [guideContent, setGuideContent] = useState<string>('');
  
  // Typ wiadomości asystenta
  type AssistantMessageType = {
    role: 'user' | 'assistant';
    content: string;
  };
  
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessageType[]>([]);
  const [assistantQuestion, setAssistantQuestion] = useState<string>('');
  const [assistantQuestionsLeft, setAssistantQuestionsLeft] = useState<number>(5);
  
  useEffect(() => {
    // Funkcja odczytująca dane z localStorage z obsługą błędów
    const getFromLocalStorage = (key: string) => {
      try {
        if (typeof window !== 'undefined') {
          const item = window.localStorage.getItem(key);
          return item;
        }
        return null;
      } catch (error) {
        console.error(`Błąd podczas odczytu ${key} z localStorage:`, error);
        return null;
      }
    };
    
    // Pobieramy dane z localStorage
    const savedDocument = getFromLocalStorage('generatedDocument');
    const savedDocumentType = getFromLocalStorage('documentType');
    const savedPaymentPlan = getFromLocalStorage('paymentPlan');
    
    // Debugowanie - wyświetlamy wartości w konsoli
    console.log('Dane z localStorage:');
    console.log('generatedDocument:', savedDocument ? 'Istnieje' : 'Brak');
    console.log('documentType:', savedDocumentType);
    console.log('paymentPlan:', savedPaymentPlan);
    
    if (!savedDocument) {
      // Jeśli nie ma dokumentu, wracamy na stronę główną
      router.push('/');
      return;
    }
    
    setDocumentContent(savedDocument);
    setDocumentType(savedDocumentType || '');
    
    // Sprawdzamy czy plan jest poprawnie określony
    const plan = savedPaymentPlan || 'basic';
    console.log('Ustawiony plan:', plan);
    setPaymentPlan(plan);
    
    // Awaryjnie - jeśli z jakiegoś powodu nie załadowały się dane z localStorage
    // przyjmujemy plan z parametru URL, jeśli jest dostępny
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlan = urlParams.get('plan');
    
    const finalPlan = urlPlan || plan;
    console.log('Końcowy plan wybrany do wyświetlenia:', finalPlan);
    
    // Ustawiamy opcje w zależności od pakietu
    if (finalPlan === 'extended' || finalPlan === 'premium') {
      console.log('Aktywuję informator dla planu:', finalPlan);
      setShowGuide(true);
      generateGuideContent(savedDocumentType || '');
    } else {
      console.log('Informator nieaktywny dla planu:', finalPlan);
      setShowGuide(false);
    }
    
    if (finalPlan === 'premium') {
      console.log('Aktywuję asystenta dla planu premium');
      setShowAssistant(true);
      // Dodajemy początkową wiadomość asystenta
      setAssistantMessages([
        {
          role: 'assistant',
          content: `Witaj! Jestem Twoim Asystentem Prawnym. Odpowiem na do 5 pytań związanych z dokumentem. W czym mogę pomóc?`
        }
      ]);
    } else {
      console.log('Asystent nieaktywny dla planu:', finalPlan);
      setShowAssistant(false);
    }
    
    // Do celów debugowania, wyświetlamy status sekcji
    console.log('Status sekcji:', {
      dokument: true,
      informator: finalPlan === 'extended' || finalPlan === 'premium',
      asystent: finalPlan === 'premium'
    });
    
    setIsLoading(false);
  }, [router]);
  
  // Lista dostępnych informatorów PDF
  const availableGuides = [
    'wypowiedzenie_najmu',
    'wypowiedzenie_pracy',
    'odwolanie_mandat',
    'reklamacja',
    'wezwanie_do_zaplaty',
    'odstapienie_od_umowy_konsument',
    'pelnomocnictwo_ogolne',
    'wniosek_zaswiadczenie',
    'umowa_pozyczki',
    'protokol_zdawczo_odbiorczy',
    'wypowiedzenie_pracodawca',
    'umowa_zlecenie',
    'umowa_o_dzielo',
    'porozumienie_o_splacie',
    'uchwala_wspolnikow_prosta'
  ];
  
  // Funkcja sprawdzająca czy istnieje informator dla danego dokumentu
  const isGuideAvailable = (docType: string) => {
    return availableGuides.includes(docType);
  };
  
  // Funkcja generująca zawartość poradnika
  const generateGuideContent = (docType: string) => {
    // Pobieramy nazwę dokumentu zamiast kodu
    let documentName = docType;
    // Tu powinno być mapowanie kodu dokumentu na nazwę
    
    if (isGuideAvailable(docType)) {
      // Informacja o dostępnym informatorze
      setGuideContent(`## W tym informatorze znajdziesz:

🔹 **Co trzeba zrobić krok po kroku** – od przygotowania po realizację

🔹 **Jakie obowiązują terminy** – i kiedy zaczynają biec

🔹 **Na co uważać, by nie popełnić błędu** – potencjalne ryzyka i jak im zapobiec

🔹 **Co grozi za spóźnienie lub pomyłkę** – czyli skutki nieterminowego działania

🔹 **Najczęstsze pytania i jasne odpowiedzi** – bez prawniczego żargonu

Twój kompleksowy informator prawny jest dostępny do pobrania jako plik PDF. Kliknij przycisk "Pobierz informator PDF", aby otrzymać pełną wersję poradnika.`);
    } else {
      // Efektowna zaślepka dla niedostępnych informatorów
      setGuideContent(`# Informator w przygotowaniu

![Informator w przygotowaniu](/images/informator-coming-soon.jpg)

### Ten informator jest obecnie w trakcie opracowywania przez nasz zespół prawny.

Pracujemy nad przygotowaniem szczegółowego i profesjonalnego informatora dla dokumentu **${documentName}**. Nasz zespół prawników dokłada wszelkich starań, aby dostarczyć Ci najwyższej jakości materiały.

#### Co znajdziesz w pełnej wersji informatora:
- Podstawę prawną dokumentu i odniesienia do przepisów
- Krok po kroku procedury związane z dokumentem
- Szczegółowe informacje o terminach i wymaganiach
- Wskazówki dotyczące potencjalnych trudności
- Odpowiedzi na najczęściej zadawane pytania

#### Tymczasem, jeśli masz pilne pytania:
- Skorzystaj z naszego Asystenta Prawnego (dostępny w pakiecie Premium)
- Skontaktuj się z nami poprzez formularz na stronie kontaktowej

**Dziękujemy za zrozumienie i cierpliwość!**`);
    }
  };
  
  // Funkcja pobierania informatora w formacie PDF
  const handleGuideDownload = () => {
    if (isGuideAvailable(documentType)) {
      // Pobieranie odpowiedniego informatora PDF na podstawie typu dokumentu
      const pdfUrl = `/guides/${documentType}.pdf`;
      
      // Otwieramy plik w nowym oknie
      window.open(pdfUrl, '_blank');
    } else {
      // Wyświetl informację o braku gotowego informatora
      alert('Informator dla wybranego dokumentu jest w przygotowaniu. Prosimy o cierpliwość - wkrótce będzie dostępny!');
    }
  };
  
  // Funkcja obsługi zadawania pytań asystentowi
  const handleAskAssistant = async () => {
    if (!assistantQuestion.trim() || assistantQuestionsLeft <= 0) return;
    
    // Dodajemy pytanie użytkownika do konwersacji
    const userQuestion = assistantQuestion;
    const updatedMessages = [
      ...assistantMessages,
      { role: 'user', content: userQuestion } as AssistantMessageType
    ];
    setAssistantMessages(updatedMessages);
    setAssistantQuestion('');
    
    try {
      const response = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          question: userQuestion,
          context: documentContent,
          history: assistantMessages
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Dodajemy odpowiedź asystenta
        const newMessages = [
          ...updatedMessages,
          { role: 'assistant', content: data.response } as AssistantMessageType
        ];
        setAssistantMessages(newMessages);
      } else {
        // Obsługa błędu
        const newMessages = [
          ...updatedMessages,
          { role: 'assistant', content: 'Przepraszam, wystąpił błąd podczas przetwarzania pytania. Proszę spróbować ponownie.' } as AssistantMessageType
        ];
        setAssistantMessages(newMessages);
      }
      
      // Zmniejszamy liczbę dostępnych pytań
      setAssistantQuestionsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Błąd:', error);
      // Dodajemy komunikat o błędzie
      const newMessages = [
        ...updatedMessages,
        { role: 'assistant', content: 'Przepraszam, wystąpił błąd podczas przetwarzania pytania. Proszę spróbować ponownie.' } as AssistantMessageType
      ];
      setAssistantMessages(newMessages);
    }
  };
  
  // Funkcja pobierania jako DOC
  const handleDownloadTxt = () => {
    try {
      // Tworzenie Blob z treścią dokumentu
      const blob = new Blob([documentContent], { type: 'application/msword' });
      
      // Tworzenie URL dla Blob
      const url = window.URL.createObjectURL(blob);
      
      // Tworzenie elementu <a> do pobrania
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType || 'dokument'}.doc`;
      document.body.appendChild(a);
      
      // Kliknięcie w link i czyszczenie
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Dokument został pobrany pomyślnie');
    } catch (error) {
      console.error('Błąd podczas pobierania dokumentu:', error);
      alert('Wystąpił błąd podczas pobierania dokumentu. Spróbuj ponownie lub skopiuj tekst do schowka.');
    }
  };
  
  // Funkcja obsługi konsultacji z prawnikiem
  const handleConsultationClick = () => {
    router.push('/konsultacje');
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Ładowanie dokumentu...</h2>
        </div>
      </div>
    );
  }
  
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
      
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Twój dokument jest gotowy!</h2>
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium mr-2">
              {paymentPlan === 'basic' && 'PODSTAWOWY'}
              {paymentPlan === 'extended' && 'ROZSZERZONY'}
              {paymentPlan === 'premium' && 'PREMIUM'}
            </span>
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              Wróć do strony głównej
            </Link>
          </div>
        </div>
        
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">Twój dokument</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">PEŁNA WERSJA</span>
          </h3>
          <textarea
            id="finalDocumentArea"
            readOnly 
            value={documentContent}
            className="mt-1 block w-full p-4 border border-gray-300 rounded-lg shadow-sm min-h-[350px] text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
          />
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(documentContent)}
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
      </div>
      
      {/* Sekcja dla poradnika */}
      {(showGuide || paymentPlan === 'extended' || paymentPlan === 'premium') && (
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">Twój informator prawny</h2>
            <button
              onClick={handleGuideDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Pobierz informator PDF
            </button>
          </div>
          <div className="prose max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: marked(guideContent) }} />
        </div>
      )}
      
      {/* Sekcja dla asystenta */}
      {(showAssistant || paymentPlan === 'premium') && (
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">Twój Asystent Prawny</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">PREMIUM</span>
          </h2>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Okno konwersacji */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {assistantMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pole wprowadzania */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={assistantQuestion}
                  onChange={(e) => setAssistantQuestion(e.target.value)}
                  placeholder="Zadaj pytanie dotyczące Twojego dokumentu..."
                  disabled={assistantQuestionsLeft <= 0}
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAskAssistant}
                  disabled={assistantQuestionsLeft <= 0 || !assistantQuestion.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                <span>{assistantQuestionsLeft > 0 
                  ? `Pozostało pytań: ${assistantQuestionsLeft}` 
                  : "Wykorzystano limit pytań"}
                </span>
                {assistantQuestionsLeft <= 0 && (
                  <button 
                    onClick={() => alert("Funkcjonalność dokupienia dodatkowych pytań będzie dostępna wkrótce.")}
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Dokup więcej pytań
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
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