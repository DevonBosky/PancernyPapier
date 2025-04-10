'use client'; // Potrzebne dla useState

import { useState, useEffect } from 'react';
import Image from 'next/image'; // Dodano import dla logo
import { useRouter } from 'next/navigation';
import Select, { GroupBase, SingleValue, ActionMeta } from 'react-select';
import Link from 'next/link';
// Importuję komponent formularza pełnomocnictwa
import PelnomocnictwoForm, { PelnomocnictwoFormData } from '@/components/PelnomocnictwoForm';
// Import biblioteki do przetwarzania markdown
import { marked } from 'marked';
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

// Definicja kategorii dokumentów
type DocumentCategory = 
  | 'pracownicze'
  | 'mieszkaniowe'
  | 'finansowe'
  | 'konsumenckie'
  | 'urzedowe'
  | 'korporacyjne';

// Kategorie z ludzkimi etykietami
const documentCategories: Record<DocumentCategory, string> = {
  pracownicze: '📄 Dokumenty pracownicze',
  mieszkaniowe: '🏠 Dokumenty mieszkaniowe',
  finansowe: '💰 Dokumenty finansowe',
  konsumenckie: '⚖️ Dokumenty konsumenckie i reklamacje',
  urzedowe: '📋 Dokumenty urzędowe i pełnomocnictwa',
  korporacyjne: '🏢 Dokumenty korporacyjne'
};

// Rozszerzona struktura opcji dokumentów z kategoriami
const documentOptions: { value: DocumentType; label: string; category: DocumentCategory }[] = [
  // Dokumenty pracownicze
  { value: 'wypowiedzenie_pracy', label: 'Wypowiedzenie umowy o pracę (przez pracownika)', category: 'pracownicze' },
  { value: 'wypowiedzenie_pracodawca', label: 'Wypowiedzenie umowy o pracę (przez pracodawcę)', category: 'pracownicze' },
  { value: 'umowa_zlecenie', label: 'Umowa zlecenie (prosty wzór)', category: 'pracownicze' },
  { value: 'umowa_o_dzielo', label: 'Umowa o dzieło (prosty wzór)', category: 'pracownicze' },
  
  // Dokumenty mieszkaniowe
  { value: 'wypowiedzenie_najmu', label: 'Wypowiedzenie umowy najmu (przez najemcę)', category: 'mieszkaniowe' },
  { value: 'protokol_zdawczo_odbiorczy', label: 'Protokół zdawczo-odbiorczy lokalu', category: 'mieszkaniowe' },
  
  // Dokumenty finansowe
  { value: 'wezwanie_do_zaplaty', label: 'Wezwanie do zapłaty', category: 'finansowe' },
  { value: 'umowa_pozyczki', label: 'Umowa pożyczki (między osobami fizycznymi)', category: 'finansowe' },
  { value: 'porozumienie_o_splacie', label: 'Porozumienie o spłacie długu w ratach', category: 'finansowe' },
  
  // Dokumenty konsumenckie
  { value: 'reklamacja', label: 'Reklamacja towaru/usługi', category: 'konsumenckie' },
  { value: 'odstapienie_od_umowy_konsument', label: 'Odstąpienie od umowy (konsument, na odległość/poza lokalem)', category: 'konsumenckie' },
  
  // Dokumenty urzędowe
  { value: 'odwolanie_mandat', label: 'Odwołanie od mandatu karnego', category: 'urzedowe' },
  { value: 'wniosek_zaswiadczenie', label: 'Wniosek o wydanie zaświadczenia', category: 'urzedowe' },
  { value: 'pelnomocnictwo_ogolne', label: 'Pełnomocnictwo ogólne', category: 'urzedowe' },
  
  // Dokumenty korporacyjne
  { value: 'uchwala_wspolnikow_prosta', label: 'Prosta uchwała wspólników Sp. z o.o.', category: 'korporacyjne' },
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

// Typy dla react-select
type DocumentOptionType = {
  value: DocumentType;
  label: string;
  category: DocumentCategory;
};

type DocumentGroupType = GroupBase<DocumentOptionType>;

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
  
  // Dodaję stan dla wybranego pakietu
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'extended' | 'premium'>('basic');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showAssistant, setShowAssistant] = useState<boolean>(false);
  const [guideContent, setGuideContent] = useState<string>('');
  
  // Definiuję typ wiadomości asystenta
  type AssistantMessageType = {
    role: 'user' | 'assistant';
    content: string;
  };
  
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessageType[]>([]);
  const [assistantQuestion, setAssistantQuestion] = useState<string>('');
  const [assistantQuestionsLeft, setAssistantQuestionsLeft] = useState<number>(5);

  // Dodaję stan dla danych formularza pełnomocnictwa
  const [pelnomocnictwoData, setPelnomocnictwoData] = useState<PelnomocnictwoFormData>({
    mocodawca: { imie: '', nazwisko: '', adres: '', pesel: '' },
    pelnomocnik: { imie: '', nazwisko: '', adres: '', pesel: '' },
    zakres_pelnomocnictwa: { typ: 'ogolne', opis: '' },
    data: '',
    miejscowosc: ''
  });

  // Przygotowanie opcji pogrupowanych dla Select
  const groupedOptions: DocumentGroupType[] = Object.entries(documentCategories).map(([categoryKey, categoryLabel]) => {
    const categoryOptions = documentOptions.filter(doc => doc.category === categoryKey);
    return {
      label: categoryLabel,
      options: categoryOptions
    };
  });

  // Obsługa wyboru dokumentu z react-select
  const handleDocumentSelectChange = (
    newValue: SingleValue<DocumentOptionType>,
    actionMeta: ActionMeta<DocumentOptionType>
  ) => {
    const value = newValue ? newValue.value : '';
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

  // Funkcja konwertująca dane formularza na format tekstowy do wysłania do API
  const convertFormDataToText = (data: PelnomocnictwoFormData): string => {
    let text = `Dane Mocodawcy:\n`;
    text += `Imię i nazwisko: ${data.mocodawca.imie} ${data.mocodawca.nazwisko}\n`;
    text += `Adres: ${data.mocodawca.adres}\n`;
    text += `PESEL: ${data.mocodawca.pesel}\n\n`;
    
    text += `Dane Pełnomocnika:\n`;
    text += `Imię i nazwisko: ${data.pelnomocnik.imie} ${data.pelnomocnik.nazwisko}\n`;
    text += `Adres: ${data.pelnomocnik.adres}\n`;
    text += `PESEL: ${data.pelnomocnik.pesel}\n\n`;
    
    text += `Zakres pełnomocnictwa: ${data.zakres_pelnomocnictwa.typ === 'ogolne' 
      ? 'Pełnomocnictwo ogólne' 
      : 'Pełnomocnictwo szczegółowe'}\n`;
    
    if (data.zakres_pelnomocnictwa.typ === 'szczegolowe' && data.zakres_pelnomocnictwa.opis) {
      text += `Szczegółowy zakres: ${data.zakres_pelnomocnictwa.opis}\n\n`;
    }
    
    text += `Data: ${data.data}\n`;
    text += `Miejscowość: ${data.miejscowosc}`;
    
    return text;
  };

  const handleGeneratePreview = async () => {
    if (!selectedDocument) {
      alert('Proszę wybrać rodzaj dokumentu.');
      return;
    }

    if (selectedDocument === 'pelnomocnictwo_ogolne') {
      // Sprawdzenie czy formularz pełnomocnictwa ma wszystkie wymagane pola
      const { mocodawca, pelnomocnik, zakres_pelnomocnictwa, data, miejscowosc } = pelnomocnictwoData;
      if (!mocodawca.imie || !mocodawca.nazwisko || !mocodawca.adres || !mocodawca.pesel ||
          !pelnomocnik.imie || !pelnomocnik.nazwisko || !pelnomocnik.adres || !pelnomocnik.pesel ||
          (zakres_pelnomocnictwa.typ === 'szczegolowe' && !zakres_pelnomocnictwa.opis) ||
          !data || !miejscowosc) {
        alert('Proszę wypełnić wszystkie wymagane pola formularza pełnomocnictwa.');
        return;
      }
    } else {
      // Dla innych dokumentów sprawdzanie pola tekstowego
      if (!detailsInput.trim()) {
        alert('Proszę wprowadzić szczegóły potrzebne do wygenerowania dokumentu.');
        return;
      }
    }

    if (!agreedToTerms) {
      alert('Proszę zaakceptować regulamin serwisu.');
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
        body: JSON.stringify({ 
          documentType: selectedDocument, 
          detailsText: selectedDocument === 'pelnomocnictwo_ogolne' 
            ? convertFormDataToText(pelnomocnictwoData) 
            : detailsInput 
        }),
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
  
  // Funkcja walidująca dane, do użycia bezpośrednio przy kliknięciu przycisku płatności
  const validateAndProcess = async (paymentFunction: () => void) => {
    if (!selectedDocument) {
      alert('Proszę wybrać rodzaj dokumentu.');
      return;
    }

    if (selectedDocument === 'pelnomocnictwo_ogolne') {
      // Sprawdzenie czy formularz pełnomocnictwa ma wszystkie wymagane pola
      const { mocodawca, pelnomocnik, zakres_pelnomocnictwa, data, miejscowosc } = pelnomocnictwoData;
      if (!mocodawca.imie || !mocodawca.nazwisko || !mocodawca.adres || !mocodawca.pesel ||
          !pelnomocnik.imie || !pelnomocnik.nazwisko || !pelnomocnik.adres || !pelnomocnik.pesel ||
          (zakres_pelnomocnictwa.typ === 'szczegolowe' && !zakres_pelnomocnictwa.opis) ||
          !data || !miejscowosc) {
        alert('Proszę wypełnić wszystkie wymagane pola formularza pełnomocnictwa.');
        return;
      }
    } else {
      // Dla innych dokumentów sprawdzanie pola tekstowego
      if (!detailsInput.trim()) {
        alert('Proszę wprowadzić szczegóły potrzebne do wygenerowania dokumentu.');
        return;
      }
    }

    if (!agreedToTerms) {
      alert('Proszę zaakceptować regulamin serwisu.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          documentType: selectedDocument, 
          detailsText: selectedDocument === 'pelnomocnictwo_ogolne' 
            ? convertFormDataToText(pelnomocnictwoData) 
            : detailsInput,
          is_final: true // Generujemy od razu finalną wersję
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Błąd podczas generowania dokumentu');
      }

      const data = await response.json();
      if (data.draft) {
        setPreviewContent(data.draft);
        paymentFunction();
      } else {
        throw new Error('Otrzymano nieprawidłową odpowiedź z serwera.');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Wystąpił błąd: ${error.message || 'Spróbuj ponownie.'}`);
      setIsLoading(false);
    }
  };
  
  // Funkcja obsługi płatności podstawowej z walidacją
  const handleBasicPaymentWithValidation = () => {
    validateAndProcess(handleSimulatedPayment);
  };
  
  // Funkcja obsługi płatności rozszerzonej z walidacją
  const handleExtendedPaymentWithValidation = () => {
    validateAndProcess(handleExtendedPayment);
  };
  
  // Funkcja obsługi płatności premium z walidacją
  const handlePremiumPaymentWithValidation = () => {
    validateAndProcess(handlePremiumPayment);
  };

  // Lista dostępnych informatorów PDF (na razie tylko 5)
  const availableGuides = [
    'wypowiedzenie_pracy',
    'umowa_zlecenie',
    'umowa_o_dzielo',
    'protokol_zdawczo_odbiorczy',
    'wezwanie_do_zaplaty'
  ];
  
  // Funkcja sprawdzająca czy istnieje informator dla danego dokumentu
  const isGuideAvailable = (documentType: string) => {
    return availableGuides.includes(documentType);
  };
  
  // Funkcja pobierania informatora w formacie PDF
  const handleGuideDownload = () => {
    if (isGuideAvailable(selectedDocument)) {
      // Pobieranie odpowiedniego informatora PDF na podstawie typu dokumentu
      const pdfUrl = `/guides/${selectedDocument}.pdf`;
      
      // Otwieramy plik w nowym oknie
      window.open(pdfUrl, '_blank');
    } else {
      // Wyświetl informację o braku gotowego informatora
      alert('Informator dla wybranego dokumentu jest w przygotowaniu. Prosimy o cierpliwość - wkrótce będzie dostępny!');
    }
  };
  
  // Funkcja obsługi symulowanej płatności
  const handleSimulatedPayment = () => {
    if (isProcessingPayment || !previewContent) return;
    
    // Symulacja procesu płatności dla MVP (w rzeczywistej aplikacji użylibyśmy Stripe)
    setIsProcessingPayment(true);
    setPaymentMessage('Przetwarzanie płatności...');
    setSelectedPlan('basic');
    
    setTimeout(() => {
      // Symulujemy zakończenie płatności
      setIsProcessingPayment(false);
      setIsPaid(true);
      setFinalContent(previewContent); // W pełnej implementacji tu byłoby wywołanie API
      setPaymentMessage('Dziękujemy za płatność! Twój dokument jest gotowy do pobrania.');
      setShowGuide(false);
      setShowAssistant(false);
    }, 2000);
  };
  
  // Funkcja obsługi płatności za pakiet rozszerzony
  const handleExtendedPayment = async () => {
    if (isProcessingPayment || !previewContent) return;
    
    setIsProcessingPayment(true);
    setPaymentMessage('Przetwarzanie płatności za pakiet rozszerzony...');
    setSelectedPlan('extended');
    
    // Symulacja płatności
    setTimeout(async () => {
      try {
        setIsProcessingPayment(false);
        setIsPaid(true);
        setFinalContent(previewContent);
        setShowGuide(true);
        setShowAssistant(false);
        
        // Sprawdzamy, czy istnieje informator dla wybranego dokumentu
        const documentType = documentOptions.find(option => option.value === selectedDocument)?.label || selectedDocument;
        
        if (isGuideAvailable(selectedDocument)) {
          // Informacja o dostępnym informatorze
          setGuideContent(`# Profesjonalny informator: ${documentType}

## Dostępny jako plik PDF

Twój kompleksowy informator prawny jest dostępny do pobrania jako plik PDF. Kliknij przycisk poniżej, aby pobrać pełną wersję informatora.

Informator zawiera:
- Podstawę prawną i konkretne przepisy
- Instrukcję krok po kroku dla całego procesu
- Terminy i potencjalne ryzyka prawne
- Odpowiedzi na najczęstsze pytania

**Kliknij przycisk "Pobierz informator PDF" poniżej, aby uzyskać dostęp do pełnej wersji.**`);
        } else {
          // Efektowna zaślepka dla niedostępnych informatorów
          setGuideContent(`# Profesjonalny informator: ${documentType}

## W przygotowaniu

![Informator w przygotowaniu](/images/informator-coming-soon.jpg)

### Ten informator jest obecnie w trakcie opracowywania przez nasz zespół prawny.

Pracujemy nad przygotowaniem szczegółowego i profesjonalnego informatora dla dokumentu **${documentType}**. Nasz zespół prawników dokłada wszelkich starań, aby dostarczyć Ci najwyższej jakości materiały.

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
        
        setPaymentMessage('Dziękujemy za płatność! Twój dokument i informator prawny są gotowe.');
      } catch (error) {
        console.error('Błąd:', error);
        setPaymentMessage('Dziękujemy za płatność! Dokument jest gotowy, ale wystąpił problem z informatorem.');
      }
    }, 2000);
  };
  
  // Funkcja obsługi płatności za pakiet premium
  const handlePremiumPayment = async () => {
    if (isProcessingPayment || !previewContent) return;
    
    setIsProcessingPayment(true);
    setPaymentMessage('Przetwarzanie płatności za pakiet premium...');
    setSelectedPlan('premium');
    
    setTimeout(async () => {
      try {
        setIsProcessingPayment(false);
        setIsPaid(true);
        setFinalContent(previewContent);
        setShowGuide(true);
        setShowAssistant(true);
        
        // Generowanie poradnika przez API OpenAI
        const documentType = documentOptions.find(option => option.value === selectedDocument)?.label || selectedDocument;
        const context = selectedDocument === 'pelnomocnictwo_ogolne' 
          ? convertFormDataToText(pelnomocnictwoData) 
          : detailsInput;
          
        const guideResponse = await fetch('/api/generate-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType, detailsText: context })
        });
        
        if (guideResponse.ok) {
          const data = await guideResponse.json();
          setGuideContent(data.guide);
        } else {
          console.error('Błąd generowania poradnika');
          setGuideContent('# Przepraszamy\nWystąpił błąd podczas generowania informatora prawnego. Spróbuj ponownie później.');
        }
        
        // Dodaj początkową wiadomość od asystenta
        setAssistantMessages([
          {
            role: 'assistant',
            content: `Witaj! Jestem Twoim Asystentem Prawnym. Odpowiem na do 5 pytań związanych z dokumentem "${documentType}". W czym mogę pomóc?`
          } as AssistantMessageType
        ]);
        
        setAssistantQuestionsLeft(5);
        setPaymentMessage('Dziękujemy za płatność! Twój dokument, informator i dostęp do Asystenta są gotowe.');
      } catch (error) {
        console.error('Błąd:', error);
        setPaymentMessage('Dziękujemy za płatność! Wystąpił problem z generowaniem niektórych elementów.');
      }
    }, 2000);
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
      const documentType = documentOptions.find(option => option.value === selectedDocument)?.label || selectedDocument;
      const context = selectedDocument === 'pelnomocnictwo_ogolne' 
        ? convertFormDataToText(pelnomocnictwoData) 
        : detailsInput;
      
      const response = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          question: userQuestion,
          context,
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
            <Select
              placeholder="Wybierz dokument lub wpisz aby wyszukać..."
              options={groupedOptions}
              onChange={handleDocumentSelectChange}
              className="mb-4"
              classNamePrefix="document-select"
              isClearable
              isSearchable
              noOptionsMessage={() => "Nie znaleziono dokumentu"}
              formatGroupLabel={(group) => (
                <div className="group-header">
                  <span className="font-medium text-gray-800">{group.label}</span>
                </div>
              )}
            />
          </section>
        )}

        {selectedDocument && (
          <>
            {selectedDocument === 'pelnomocnictwo_ogolne' ? (
              // Renderuję formularz dla pełnomocnictwa
              <div className="mb-6">
                <PelnomocnictwoForm 
                  onDataChange={setPelnomocnictwoData}
                  initialData={pelnomocnictwoData}
                />
              </div>
            ) : (
              // Renderuję standardowe pole tekstowe dla innych dokumentów
              <div className="mb-6">
                <label htmlFor="details-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Podaj szczegóły potrzebne do wygenerowania dokumentu:
                </label>
                <textarea
                  id="details-input"
                  rows={12}
                  className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={selectedDocument ? documentPlaceholders[selectedDocument] : ''}
                  value={detailsInput}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            )}

            {/* Sekcja z wyjaśnieniem wymaganych informacji - pokazuję tylko gdy NIE jest to pełnomocnictwo */}
            {selectedDocument !== 'pelnomocnictwo_ogolne' && (
              <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-md font-medium text-blue-800 mb-2">Wymagane informacje dla tego dokumentu:</h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  {documentPlaceholders[selectedDocument].split('\n').map((line, idx) => {
                    if (idx === 0) return null; // Pomijam pierwszy wiersz
                    return <li key={idx}>{line}</li>;
                  })}
                </ul>
              </div>
            )}

            <div className="mb-6 flex items-center">
              <input
                id="terms-checkbox"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms-checkbox" className="ml-2 block text-sm text-gray-700">
                Akceptuję <Link href="/regulamin" target="_blank" className="text-blue-600 hover:text-blue-800 underline">regulamin</Link> serwisu
              </label>
            </div>

            {/* Opcje płatności bezpośrednio po formularzu i akceptacji regulaminu */}
            <div className="space-y-4" id="payment-options">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wybierz pakiet</h3>
                <p className="text-sm text-gray-700 mb-3 px-4">
                  Po dokonaniu płatności otrzymasz <strong>finalną wersję dokumentu</strong> ze wszystkimi uzupełnionymi danymi. Dokument będzie gotowy do użycia bez konieczności ręcznego zastępowania pól.
                </p>
              </div>
              
              {/* Opcja podstawowa */}
              <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow hover:shadow-md transition-all">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Podstawowy dokument</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      Gotowy do użycia dokument z uzupełnionymi danymi, który możesz natychmiast pobrać i wykorzystać.
                    </p>
                  </div>
                  <div className="text-green-700 font-bold text-lg ml-4">
                    8 PLN
                  </div>
                </div>
                <button
                  onClick={handleBasicPaymentWithValidation}
                  disabled={isProcessingPayment || isLoading || !agreedToTerms}
                  className="w-full mt-2 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessingPayment && selectedPlan === 'basic' ? (
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
                      Kup dokument
                    </span>
                  )}
                </button>
              </div>
              
              {/* Opcja rozszerzona */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border-2 border-blue-200 shadow-md hover:shadow-lg transition-all relative">
                <div className="absolute -top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Polecane
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Dokument + Profesjonalny informator prawny</h3>
                    <p className="text-sm text-gray-700 mt-1 mb-2">
                      Otrzymasz kompletny dokument oraz szczegółowy informator prawny zawierający:
                    </p>
                    <ul className="text-xs text-gray-700 list-disc pl-5 space-y-1 mb-3">
                      <li>Podstawę prawną i konkretne przepisy</li>
                      <li>Instrukcję krok po kroku dla całego procesu</li>
                      <li>Terminy i potencjalne ryzyka prawne</li>
                      <li>Odpowiedzi na najczęstsze pytania</li>
                    </ul>
                  </div>
                  <div className="text-blue-700 font-bold text-lg ml-4">
                    10 PLN
                  </div>
                </div>
                <button
                  onClick={handleExtendedPaymentWithValidation}
                  disabled={isProcessingPayment || isLoading || !agreedToTerms}
                  className="w-full mt-2 inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessingPayment && selectedPlan === 'extended' ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Kup dokument + informator
                    </span>
                  )}
                </button>
              </div>
              
              {/* Opcja premium */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Pakiet Premium: Dokument + Informator + Asystent Prawny</h3>
                    <p className="text-sm text-gray-700 mt-1 mb-2">
                      Zawiera wszystko z poprzednich pakietów oraz:
                    </p>
                    <ul className="text-xs text-gray-700 list-disc pl-5 space-y-1 mb-3">
                      <li>Dostęp do Asystenta Prawnego opartego na AI</li>
                      <li>Do 5 szczegółowych pytań dotyczących Twojej sprawy</li>
                      <li>Precyzyjne odpowiedzi uwzględniające polski kontekst prawny</li>
                      <li>Możliwość doprecyzowania szczegółów Twojej sytuacji</li>
                    </ul>
                  </div>
                  <div className="text-purple-700 font-bold text-lg ml-4">
                    15 PLN
                  </div>
                </div>
                <button
                  onClick={handlePremiumPaymentWithValidation}
                  disabled={isProcessingPayment || isLoading || !agreedToTerms}
                  className="w-full mt-2 inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessingPayment && selectedPlan === 'premium' ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Kup pakiet Premium
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
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

        {/* Nowa sekcja dla poradnika */}
        {isPaid && showGuide && (
          <section className="mt-8 p-6 bg-white rounded-lg shadow-md">
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
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked(guideContent) }} />
          </section>
        )}
        
        {/* Nowa sekcja dla asystenta */}
        {isPaid && showAssistant && (
          <section className="mt-8">
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
