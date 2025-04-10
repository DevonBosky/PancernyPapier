import Link from 'next/link';

export default function RegulaminPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Regulamin Serwisu Pancerny Papier</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§1. Postanowienia Ogólne</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              1.1. Niniejszy regulamin określa zasady korzystania z serwisu internetowego Pancerny Papier, dostępnego pod adresem internetowym pancernypapier.pl.
            </p>
            <p>
              1.2. Właścicielem i administratorem serwisu jest [Nazwa Firmy], z siedzibą w [Adres], NIP: [Numer NIP], REGON: [Numer REGON], zwany dalej &quot;Usługodawcą&quot;.
            </p>
            <p>
              1.3. Serwis umożliwia generowanie wstępnych wersji roboczych wybranych dokumentów prawnych i administracyjnych przy użyciu modelu językowego AI, po podaniu przez Użytkownika wymaganych danych.
            </p>
            <p>
              1.4. Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu w całości.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§2. Definicje</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              2.1. <strong>Serwis</strong> - platforma internetowa dostępna pod adresem pancernypapier.pl, umożliwiająca generowanie wstępnych i finalnych wersji dokumentów prawnych.
            </p>
            <p>
              2.2. <strong>Użytkownik</strong> - osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, korzystająca z Serwisu.
            </p>
            <p>
              2.3. <strong>Wstępna wersja dokumentu</strong> - dokument wygenerowany bezpłatnie przez Serwis, zawierający placeholdery w miejsce konkretnych danych. 
            </p>
            <p>
              2.4. <strong>Finalna wersja dokumentu</strong> - dokument wygenerowany przez Serwis po uiszczeniu opłaty, zawierający wszystkie dane bez placeholderów, gotowy do wykorzystania.
            </p>
            <p>
              2.5. <strong>Opłata</strong> - jednorazowa płatność za uzyskanie dostępu do finalnej wersji dokumentu, wynosząca 8 PLN brutto.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§3. Zakres Usług</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              3.1. Serwis świadczy usługę generowania wersji roboczych i finalnych dokumentów na podstawie danych wprowadzonych przez Użytkownika.
            </p>
            <p>
              3.2. Wygenerowane dokumenty mają charakter wyłącznie poglądowy i stanowią punkt wyjścia do dalszej pracy.
            </p>
            <p>
              3.3. Dostępne rodzaje dokumentów obejmują:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Wypowiedzenie umowy najmu przez najemcę</li>
              <li>Wypowiedzenie umowy o pracę przez pracownika</li>
              <li>Odwołanie od mandatu karnego</li>
              <li>Reklamacja towaru lub usługi</li>
              <li>Wezwanie do zapłaty</li>
            </ul>
            <p>
              3.4. Usługodawca zastrzega sobie prawo do modyfikacji zakresu oferowanych dokumentów bez wcześniejszego powiadomienia.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§4. Ograniczenie Odpowiedzialności</h2>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <p className="text-red-700 font-medium">
              WAŻNE: Serwis Pancerny Papier nie świadczy usług doradztwa prawnego. Wygenerowane dokumenty nie stanowią porady prawnej i nie zastępują konsultacji z wykwalifikowanym prawnikiem (radcą prawnym lub adwokatem).
            </p>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>
              4.1. Użytkownik jest w pełni odpowiedzialny za weryfikację treści wygenerowanego dokumentu, jego poprawność merytoryczną, prawną oraz dostosowanie do indywidualnej sytuacji.
            </p>
            <p>
              4.2. Operator Serwisu nie ponosi odpowiedzialności za jakiekolwiek szkody wynikłe z wykorzystania wygenerowanych dokumentów bez ich uprzedniej weryfikacji przez profesjonalistę lub w sposób niezgodny z ich przeznaczeniem.
            </p>
            <p>
              4.3. Treści generowane są automatycznie przez model sztucznej inteligencji i mogą zawierać błędy, nieaktualności lub braki.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§5. Płatności</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              5.1. Uzyskanie dostępu do pełnej, edytowalnej wersji wygenerowanego dokumentu wymaga uiszczenia jednorazowej opłaty w wysokości 8 PLN.
            </p>
            <p>
              5.2. Płatności obsługiwane są przez zewnętrznego operatora płatności Stripe. Warunki płatności określa regulamin operatora płatności.
            </p>
            <p>
              5.3. Ceny podane w Serwisie są cenami brutto, zawierającymi podatek VAT.
            </p>
            <p>
              5.4. Po dokonaniu płatności Użytkownik otrzymuje natychmiastowy dostęp do finalnej wersji dokumentu.
            </p>
            <p>
              5.5. Operator serwisu zastrzega sobie prawo do zmiany cen usług, przy czym zmiana nie dotyczy usług w trakcie realizacji.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§6. Ochrona Danych Osobowych / Prywatność</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              6.1. Operator Serwisu przetwarza dane osobowe Użytkowników zgodnie z obowiązującymi przepisami prawa oraz Polityką Prywatności dostępną pod adresem [Link do Polityki Prywatności].
            </p>
            <p>
              6.2. Dane wprowadzane przez Użytkownika w celu wygenerowania dokumentu są przekazywane do API OpenAI w celu przetworzenia i nie są trwale przechowywane przez Operatora Serwisu, z wyjątkiem danych niezbędnych do realizacji procesu płatności lub w celach analitycznych (w formie zanonimizowanej).
            </p>
            <p>
              6.3. Użytkownik wyraża zgodę na przetwarzanie swoich danych osobowych w zakresie niezbędnym do świadczenia usług przez Serwis.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§7. Prawa Autorskie</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              7.1. Wszelkie prawa do Serwisu, w tym do jego nazwy, domeny internetowej, szaty graficznej, logotypów, treści i funkcjonalności, należą do Operatora Serwisu.
            </p>
            <p>
              7.2. Użytkownik uzyskuje pełne prawa do korzystania z wygenerowanego i opłaconego dokumentu.
            </p>
            <p>
              7.3. Zabronione jest kopiowanie, modyfikowanie i rozpowszechnianie elementów Serwisu bez zgody Operatora.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">§8. Postanowienia Końcowe</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              8.1. Operator zastrzega sobie prawo do zmiany Regulaminu. Zmiany wchodzą w życie po upływie 7 dni od daty ich publikacji w Serwisie.
            </p>
            <p>
              8.2. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.
            </p>
            <p>
              8.3. Wszelkie spory wynikłe z korzystania z Serwisu będą rozstrzygane w pierwszej kolejności na drodze negocjacji, a w przypadku braku porozumienia, przez sąd właściwy miejscowo dla siedziby Operatora.
            </p>
            <p>
              8.4. Regulamin wchodzi w życie z dniem [data publikacji].
            </p>
          </div>
        </section>

        <div className="mt-10 text-center">
           <Link href="/" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
               Powrót do strony głównej
           </Link>
        </div>

      </div>
      
      <footer className="text-center mb-8">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Pancerny Papier. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </main>
  );
} 