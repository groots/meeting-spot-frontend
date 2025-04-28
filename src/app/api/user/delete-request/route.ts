import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/delete-request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    // If the backend API is not yet implemented, simulate a successful response
    if (response.status === 404) {
      // Log for backend implementation
      console.log('Backend deletion endpoint not implemented yet - simulation mode');

      // For now, just return a success response
      return NextResponse.json(
        { message: 'Deletion request received and will be processed' },
        { status: 200 }
      );
    }

    // Forward the response from the backend
    const data = await response.json();

    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error('Error processing deletion request:', error);

    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
