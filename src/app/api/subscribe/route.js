import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const API_KEY = process.env.MAILERLITE_API_KEY;

    if (!API_KEY) {
      console.error('MAILERLITE_API_KEY is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Petició a MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        status: 'active', // O 'unconfirmed' si vols doble opt-in
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.message || 'Error subscribing to MailerLite' 
      }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
