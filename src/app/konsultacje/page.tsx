'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Definicja typu dla prawnika
interface Lawyer {
  id: number;
  name: string;
  title: string;
  specialization: string;
  experience: string;
  bio: string;
  availability: string[];
  image: string;
}

// Dane przykładowych prawników
const lawyers: Lawyer[] = [
  {
    id: 1,
    name: 'Anna Kowalska',
    title: 'Radca Prawny',
    specialization: 'Prawo cywilne, prawo umów',
    experience: '8 lat doświadczenia',
    bio: 'Specjalizuję się w prawie cywilnym i prawie umów. Pomagam klientom indywidualnym oraz małym przedsiębiorcom w sprawach związanych z umowami najmu, umowami o pracę oraz reklamacjami.',
    availability: ['Poniedziałek', 'Środa', 'Piątek'],
    image: '/logo.png',
  },
  {
    id: 2,
    name: 'Jan Nowak',
    title: 'Adwokat',
    specialization: 'Prawo pracy, spory z pracodawcą',
    experience: '12 lat doświadczenia',
    bio: 'Zajmuję się głównie sprawami z zakresu prawa pracy, w tym sporami z pracodawcami, odwołaniami od wypowiedzeń, mobbingiem oraz dyskryminacją w miejscu pracy. Doradzam również w kwestiach związanych z BHP.',
    availability: ['Wtorek', 'Czwartek'],
    image: '/logo.png',
  },
  {
    id: 3,
    name: 'Krzysztof Wiśniewski',
    title: 'Radca Prawny',
    specialization: 'Prawo konsumenckie, reklamacje',
    experience: '5 lat doświadczenia',
    bio: 'Specjalizuję się w prawie konsumenckim, reklamacjach oraz sporach z dostawcami usług. Pomagam w sprawach związanych z wadliwymi produktami, nieuczciwymi praktykami sprzedażowymi oraz prawami konsumenta.',
    availability: ['Poniedziałek', 'Wtorek', 'Piątek'],
    image: '/logo.png',
  },
];

// Komponent wyświetlający kalendarz z dostępnymi terminami
interface ScheduleCalendarProps {
  lawyer: Lawyer;
  onClose: () => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ lawyer, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  
  // Symulujemy dostępne godziny dla każdego dnia tygodnia
  const availableHours = ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
    // Tutaj można by wysłać dane do API
  };
  
  if (formSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Konsultacja została umówiona!</h3>
            <p className="text-gray-600">
              Potwierdzenie spotkania z {lawyer.name} w dniu {selectedDate} o godz. {selectedTime} zostało wysłane na Twój adres email.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Umów konsultację z {lawyer.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz dzień:
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            >
              <option value="">-- Wybierz --</option>
              {lawyer.availability.map((day) => (
                <option key={day} value={day}>
                  {day} - {new Date().toLocaleDateString('pl-PL')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz godzinę:
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              disabled={!selectedDate}
            >
              <option value="">-- Wybierz --</option>
              {availableHours.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twój adres email:
            </label>
            <input 
              type="email" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="jan.kowalski@example.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Krótki opis sprawy:
            </label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Opisz krótko swoją sprawę, aby prawnik mógł się przygotować..."
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!selectedDate || !selectedTime}
          >
            Potwierdź rezerwację
          </button>
        </form>
      </div>
    </div>
  );
};

// Główny komponent strony
export default function KonsultacjePage() {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  
  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-5xl">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Powrót do strony głównej
        </Link>
        
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-100 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Konsultacja z prawnikiem</h1>
          <p className="text-gray-600 mb-8">
            Potrzebujesz profesjonalnej porady dotyczącej Twojego dokumentu? Nasi prawnicy są gotowi pomóc.
            Wybierz specjalistę i umów się na konsultację online.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-40 relative bg-gray-100">
                  <Image 
                    src={lawyer.image} 
                    alt={`Zdjęcie ${lawyer.name}`} 
                    width={500}
                    height={300}
                    style={{ objectFit: 'cover' }}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{lawyer.name}</h3>
                    <p className="text-blue-600 font-medium">{lawyer.title}</p>
                    <p className="text-gray-500 text-sm mb-2">{lawyer.specialization}</p>
                    <p className="text-gray-700 text-sm">{lawyer.experience}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mb-3">
                    <p className="text-gray-600 text-sm line-clamp-3">{lawyer.bio}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {lawyer.availability.map((day) => (
                      <span key={day} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {day}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setSelectedLawyer(lawyer)}
                    className="w-full py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Wybierz termin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Jak przebiegają konsultacje online?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Wybierz termin</h3>
              <p className="text-gray-600">Wybierz dogodny termin spośród dostępnych dat i godzin konsultacji.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Otrzymaj potwierdzenie</h3>
              <p className="text-gray-600">Otrzymasz email z potwierdzeniem i linkiem do wideorozmowy.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Odbądź konsultację</h3>
              <p className="text-gray-600">Połącz się w wybranym terminie i skonsultuj swój dokument z prawnikiem.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center mb-8">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Pancerny Papier. Wszelkie prawa zastrzeżone.</p>
      </footer>
      
      {selectedLawyer && (
        <ScheduleCalendar 
          lawyer={selectedLawyer} 
          onClose={() => setSelectedLawyer(null)} 
        />
      )}
    </main>
  );
} 