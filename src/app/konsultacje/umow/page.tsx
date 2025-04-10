'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Komponent formularza używający useSearchParams opakowany w Suspense
function ConsultationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pobieranie parametrów z URL
  const lawyerIdParam = searchParams.get('lawyer') || '';
  const documentTypeParam = searchParams.get('document') || '';
  
  const [formData, setFormData] = useState({
    lawyer: lawyerIdParam,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    documentType: documentTypeParam,
    description: '',
    agreeTos: false
  });
  
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const lawyers = [
    { id: '1', name: 'Anna Kowalska', specialization: 'Prawo cywilne, prawo umów' },
    { id: '2', name: 'Jan Nowak', specialization: 'Prawo pracy, spory z pracodawcą' },
    { id: '3', name: 'Krzysztof Wiśniewski', specialization: 'Prawo konsumenckie, reklamacje' },
  ];
  
  const documentTypes = [
    { id: 'wypowiedzenie_najmu', label: 'Wypowiedzenie umowy najmu' },
    { id: 'wypowiedzenie_pracy', label: 'Wypowiedzenie umowy o pracę' },
    { id: 'odwolanie_mandat', label: 'Odwołanie od mandatu' },
    { id: 'reklamacja', label: 'Reklamacja towaru lub usługi' },
    { id: 'wezwanie_do_zaplaty', label: 'Wezwanie do zapłaty' },
  ];
  
  // Inicjalizacja dostępnych dat (następne 14 dni)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Pomijamy weekendy
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    setAvailableDates(dates);
  }, []);
  
  // Aktualizacja dostępnych godzin po wyborze daty
  useEffect(() => {
    if (formData.date) {
      // Symulacja różnych godzin dla różnych dni tygodnia
      const date = new Date(formData.date);
      const day = date.getDay();
      
      const morningSlots = ['09:00', '10:00', '11:00'];
      const afternoonSlots = ['13:00', '14:00', '15:00', '16:00'];
      
      // W poniedziałki i środy dostępne są poranne godziny
      // W pozostałe dni dostępne są popołudniowe godziny
      const times = (day === 1 || day === 3) ? morningSlots : afternoonSlots;
      
      setAvailableTimes(times);
    }
  }, [formData.date]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Symulacja wysyłania formularza
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };
  
  if (submitted) {
    return (
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Powrót do strony głównej
        </Link>
        
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-100 mb-8">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Konsultacja została umówiona!</h1>
            
            <p className="text-gray-600 mb-6">
              Dziękujemy za umówienie konsultacji z {lawyers.find(l => l.id === formData.lawyer)?.name || 'wybranym prawnikiem'}.
              Na Twój adres email ({formData.email}) została wysłana wiadomość z potwierdzeniem i szczegółami spotkania.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700 text-sm mb-6">
              <p className="font-medium mb-2">Szczegóły konsultacji:</p>
              <p>Data: {formData.date}, godzina: {formData.time}</p>
              <p>Prawnik: {lawyers.find(l => l.id === formData.lawyer)?.name}</p>
              <p>Typ dokumentu: {documentTypes.find(d => d.id === formData.documentType)?.label || 'Nie określono'}</p>
            </div>
            
            <Link href="/" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl">
      <Link href="/konsultacje" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Powrót do listy prawników
      </Link>
      
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Umów konsultację z prawnikiem</h1>
        <p className="text-gray-600 mb-6">
          Wypełnij poniższy formularz, aby zarezerwować termin konsultacji online.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="lawyer" className="block text-sm font-medium text-gray-700 mb-1">
                Wybierz prawnika:
              </label>
              <select
                id="lawyer"
                name="lawyer"
                value={formData.lawyer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Wybierz prawnika --</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} - {lawyer.specialization}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                Rodzaj dokumentu:
              </label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Wybierz rodzaj dokumentu --</option>
                {documentTypes.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Imię:
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Nazwisko:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adres email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Numer telefonu:
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Data konsultacji:
              </label>
              <select
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Wybierz datę --</option>
                {availableDates.map(date => {
                  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  return (
                    <option key={date} value={date}>
                      {formattedDate}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Godzina konsultacji:
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.date}
              >
                <option value="">-- Wybierz godzinę --</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Krótki opis sprawy:
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Opisz krótko swoją sprawę, aby prawnik mógł się przygotować..."
              required
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeTos"
                name="agreeTos"
                type="checkbox"
                checked={formData.agreeTos}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeTos" className="text-gray-700">
                Akceptuję <Link href="/regulamin" target="_blank" className="text-blue-600 hover:text-blue-800 underline">regulamin</Link> oraz wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usługi konsultacji.
              </label>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Przetwarzanie...
                </span>
              ) : 'Umów konsultację'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Jak przebiega konsultacja online?</h2>
        <ol className="space-y-4 text-gray-700">
          <li className="flex gap-3">
            <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <p>Po wypełnieniu formularza i wyborze dogodnego terminu, otrzymasz potwierdzenie na swój adres email.</p>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <p>15 minut przed konsultacją otrzymasz link do wideorozmowy. Możesz połączyć się przez przeglądarkę bez instalowania dodatkowego oprogramowania.</p>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            <p>Konsultacja trwa 30 minut. W tym czasie prawnik przeanalizuje Twój dokument i odpowie na Twoje pytania.</p>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-semibold text-sm">4</span>
            </div>
            <p>Po konsultacji otrzymasz email z podsumowaniem oraz ewentualnymi dodatkowymi materiałami.</p>
          </li>
        </ol>
      </div>
    </div>
  );
}

// Komponent ładowania dla Suspense
function LoadingFallback() {
  return (
    <div className="w-full max-w-2xl p-6 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center space-x-2 animate-pulse">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      </div>
      <p className="mt-4 text-gray-600">Ładowanie formularza...</p>
    </div>
  );
}

// Główny komponent strony opakowujący w Suspense
export default function UmowKonsultacje() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <Suspense fallback={<LoadingFallback />}>
        <ConsultationFormContent />
      </Suspense>
    </main>
  );
} 