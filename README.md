# Pancerny Papier

Aplikacja do generowania i personalizacji dokumentów prawnych z wykorzystaniem AI.

## Funkcje

- Generowanie wstępnych wersji dokumentów prawnych (wypowiedzenia, reklamacje, wezwania do zapłaty)
- Możliwość zakupu pełnej, spersonalizowanej wersji dokumentu
- Konsultacje online z doświadczonymi prawnikami
- Intuicyjny interfejs użytkownika

## Wymagania

- Node.js 18+
- npm lub yarn

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/twoja-nazwa-uzytkownika/pancerny-papier.git
cd pancerny-papier
```

2. Zainstaluj zależności:
```bash
npm install
# lub
yarn install
```

3. Utwórz plik `.env.local` bazując na `.env.example` i wypełnij go swoimi kluczami API:
```bash
cp .env.example .env.local
```

4. Uruchom serwer deweloperski:
```bash
npm run dev
# lub
yarn dev
```

5. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## Struktura projektu

- `/src/app` - Główne komponenty aplikacji
- `/src/app/api` - Endpointy API (OpenAI, Stripe)
- `/src/app/konsultacja` - Strona konsultacji prawnych
- `/src/app/regulamin` - Strona regulaminu
- `/public` - Zasoby statyczne

## Licencja

[MIT](https://choosealicense.com/licenses/mit/)
