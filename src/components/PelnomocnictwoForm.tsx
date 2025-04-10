import { useState } from 'react';

// Interfejs dla danych formularza
export interface PelnomocnictwoFormData {
  mocodawca: {
    imie: string;
    nazwisko: string;
    adres: string;
    pesel: string;
  };
  pelnomocnik: {
    imie: string;
    nazwisko: string;
    adres: string;
    pesel: string;
  };
  zakres_pelnomocnictwa: {
    typ: 'ogolne' | 'szczegolowe';
    opis: string;
  };
  data: string;
  miejscowosc: string;
}

// Interfejs dla propsów komponentu
interface PelnomocnictwoFormProps {
  onDataChange: (data: PelnomocnictwoFormData) => void;
  initialData?: PelnomocnictwoFormData;
}

// Komponent formularza
export default function PelnomocnictwoForm({ onDataChange, initialData }: PelnomocnictwoFormProps) {
  const [formData, setFormData] = useState<PelnomocnictwoFormData>(
    initialData || {
      mocodawca: { imie: '', nazwisko: '', adres: '', pesel: '' },
      pelnomocnik: { imie: '', nazwisko: '', adres: '', pesel: '' },
      zakres_pelnomocnictwa: { typ: 'ogolne', opis: '' },
      data: '',
      miejscowosc: ''
    }
  );

  // Funkcja obsługująca zmiany w polach formularza
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    group: string,
    field?: string
  ) => {
    const value = e.target.value;
    
    if (field) {
      // Aktualizacja zagnieżdżonego pola
      setFormData(prev => ({
        ...prev,
        [group]: {
          ...prev[group as keyof PelnomocnictwoFormData] as any,
          [field]: value
        }
      }));
    } else {
      // Aktualizacja pola na najwyższym poziomie
      setFormData(prev => ({
        ...prev,
        [group]: value
      }));
    }
    
    // Powiadomienie rodzica o zmianie danych
    onDataChange(formData);
  };

  return (
    <div className="space-y-6">
      {/* Dane mocodawcy */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Dane mocodawcy (osoba udzielająca pełnomocnictwa)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mocodawca-imie" className="block text-sm font-medium text-gray-700 mb-1">
              Imię*
            </label>
            <input
              type="text"
              id="mocodawca-imie"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.mocodawca.imie}
              onChange={(e) => handleInputChange(e, 'mocodawca', 'imie')}
              placeholder="Jan"
              required
            />
          </div>
          <div>
            <label htmlFor="mocodawca-nazwisko" className="block text-sm font-medium text-gray-700 mb-1">
              Nazwisko*
            </label>
            <input
              type="text"
              id="mocodawca-nazwisko"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.mocodawca.nazwisko}
              onChange={(e) => handleInputChange(e, 'mocodawca', 'nazwisko')}
              placeholder="Kowalski"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="mocodawca-adres" className="block text-sm font-medium text-gray-700 mb-1">
              Adres zamieszkania*
            </label>
            <input
              type="text"
              id="mocodawca-adres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.mocodawca.adres}
              onChange={(e) => handleInputChange(e, 'mocodawca', 'adres')}
              placeholder="ul. Przykładowa 1/2, 00-001 Warszawa"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="mocodawca-pesel" className="block text-sm font-medium text-gray-700 mb-1">
              PESEL*
            </label>
            <input
              type="text"
              id="mocodawca-pesel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.mocodawca.pesel}
              onChange={(e) => handleInputChange(e, 'mocodawca', 'pesel')}
              placeholder="12345678901"
              maxLength={11}
              required
            />
          </div>
        </div>
      </div>

      {/* Dane pełnomocnika */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Dane pełnomocnika (osoba otrzymująca pełnomocnictwo)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pelnomocnik-imie" className="block text-sm font-medium text-gray-700 mb-1">
              Imię*
            </label>
            <input
              type="text"
              id="pelnomocnik-imie"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.pelnomocnik.imie}
              onChange={(e) => handleInputChange(e, 'pelnomocnik', 'imie')}
              placeholder="Anna"
              required
            />
          </div>
          <div>
            <label htmlFor="pelnomocnik-nazwisko" className="block text-sm font-medium text-gray-700 mb-1">
              Nazwisko*
            </label>
            <input
              type="text"
              id="pelnomocnik-nazwisko"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.pelnomocnik.nazwisko}
              onChange={(e) => handleInputChange(e, 'pelnomocnik', 'nazwisko')}
              placeholder="Nowak"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="pelnomocnik-adres" className="block text-sm font-medium text-gray-700 mb-1">
              Adres zamieszkania*
            </label>
            <input
              type="text"
              id="pelnomocnik-adres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.pelnomocnik.adres}
              onChange={(e) => handleInputChange(e, 'pelnomocnik', 'adres')}
              placeholder="ul. Kwiatowa 3/4, 00-002 Warszawa"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="pelnomocnik-pesel" className="block text-sm font-medium text-gray-700 mb-1">
              PESEL*
            </label>
            <input
              type="text"
              id="pelnomocnik-pesel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.pelnomocnik.pesel}
              onChange={(e) => handleInputChange(e, 'pelnomocnik', 'pesel')}
              placeholder="98765432109"
              maxLength={11}
              required
            />
          </div>
        </div>
      </div>

      {/* Zakres pełnomocnictwa */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Zakres pełnomocnictwa</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ pełnomocnictwa*</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="typ-ogolne"
                  name="typ-pelnomocnictwa"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  checked={formData.zakres_pelnomocnictwa.typ === 'ogolne'}
                  onChange={() => {
                    setFormData({
                      ...formData, 
                      zakres_pelnomocnictwa: { 
                        ...formData.zakres_pelnomocnictwa,
                        typ: 'ogolne'
                      }
                    });
                    onDataChange(formData);
                  }}
                  required
                />
                <label htmlFor="typ-ogolne" className="ml-2 block text-sm text-gray-700">
                  Pełnomocnictwo ogólne (do reprezentowania we wszystkich sprawach)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="typ-szczegolowe"
                  name="typ-pelnomocnictwa"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  checked={formData.zakres_pelnomocnictwa.typ === 'szczegolowe'}
                  onChange={() => {
                    setFormData({
                      ...formData, 
                      zakres_pelnomocnictwa: {
                        ...formData.zakres_pelnomocnictwa,
                        typ: 'szczegolowe'
                      }
                    });
                    onDataChange(formData);
                  }}
                />
                <label htmlFor="typ-szczegolowe" className="ml-2 block text-sm text-gray-700">
                  Pełnomocnictwo szczególne (do określonych czynności)
                </label>
              </div>
            </div>
          </div>
          
          {formData.zakres_pelnomocnictwa.typ === 'szczegolowe' && (
            <div>
              <label htmlFor="zakres-opis" className="block text-sm font-medium text-gray-700 mb-1">
                Szczegółowy opis zakresu pełnomocnictwa*
              </label>
              <textarea
                id="zakres-opis"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.zakres_pelnomocnictwa.opis}
                onChange={(e) => handleInputChange(e, 'zakres_pelnomocnictwa', 'opis')}
                placeholder="np. reprezentowania przed urzędami, odbioru przesyłek, podpisywania dokumentów, zawierania umów, itp."
                rows={4}
                required={formData.zakres_pelnomocnictwa.typ === 'szczegolowe'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Data i miejsce */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Data i miejsce sporządzenia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="miejscowosc" className="block text-sm font-medium text-gray-700 mb-1">
              Miejscowość*
            </label>
            <input
              type="text"
              id="miejscowosc"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.miejscowosc}
              onChange={(e) => handleInputChange(e, 'miejscowosc')}
              placeholder="Warszawa"
              required
            />
          </div>
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data*
            </label>
            <input
              type="date"
              id="data"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.data}
              onChange={(e) => handleInputChange(e, 'data')}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>* - pola wymagane</p>
      </div>
    </div>
  );
} 