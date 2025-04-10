import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Używamy zmiennych środowiskowych dla kluczy API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Używamy zmiennej środowiskowej dla domeny
const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    // Sprawdzamy czy klucz API jest dostępny
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Brak klucza STRIPE_SECRET_KEY w zmiennych środowiskowych');
      return NextResponse.json(
        { error: 'Konfiguracja serwera niekompletna (brak klucza API)' }, 
        { status: 500 }
      );
    }
    
    // W przyszłości można przekazać ID produktu lub sesji użytkownika
    // const body = await request.json(); 
    
    // Na razie tworzymy prostą sesję dla stałej ceny
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'p24'], // Dodaj metody płatności np. Przelewy24
      line_items: [
        {
          price_data: {
            currency: 'pln', // Waluta PLN
            product_data: {
              name: 'Dostęp do wersji edytowalnej dokumentu',
              // description: `Typ dokumentu: ${body.documentType || 'Nieokreślony'}`,
              // images: ['URL_DO_LOGO_LUB_IKONY'], // Opcjonalnie
            },
            unit_amount: 800, // Cena w groszach (8 PLN = 800 groszy)
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Jednorazowa płatność
      success_url: `${YOUR_DOMAIN}/?payment_success=true`, // Uproszczony URL sukcesu dla MVP
      cancel_url: `${YOUR_DOMAIN}/?payment_canceled=true`, // Uproszczony URL anulowania dla MVP
    });

    if (!session.url) {
       throw new Error('Nie udało się utworzyć adresu URL sesji Stripe.');
    }

    // Zwracamy URL do przekierowania użytkownika na stronę płatności Stripe
    // Zamiast przekierowywać, zwracamy ID sesji, aby użyć @stripe/stripe-js na frontendzie
    // return NextResponse.redirect(session.url);
    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Błąd podczas tworzenia sesji Stripe Checkout:', error);
    return NextResponse.json({ error: error.message || 'Wewnętrzny błąd serwera' }, { status: 500 });
  }
} 