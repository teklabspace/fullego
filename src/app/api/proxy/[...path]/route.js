/**
 * API Proxy Route
 * Proxies all API requests to the backend to avoid CORS issues
 * This route works in development mode
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// In Next.js 15, `params` is a Promise and must be awaited before accessing properties
export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, 'PATCH');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(request, params, method) {
  try {
    // In Next.js 15, `params` is a Promise and must be awaited
    const resolvedParams = params && typeof params.then === 'function' 
      ? await params 
      : (params || {});

    // Get the path from params
    const path = resolvedParams.path ? resolvedParams.path.join('/') : '';
    const apiPath = `/api/v1/${path}`;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL.replace(/\/$/, '')}${apiPath}${queryString ? `?${queryString}` : ''}`;

    // Get request body if present
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          body = await request.json();
        } else if (contentType && contentType.includes('multipart/form-data')) {
          body = await request.formData();
        } else {
          body = await request.text();
        }
      } catch (e) {
        // No body or error reading body
        body = null;
      }
    }

    // Get headers
    const headers = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward content-type if present
    const contentType = request.headers.get('content-type');
    if (contentType && !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType;
    }

    // Make request to backend
    const fetchOptions = {
      method,
      headers,
    };

    if (body) {
      if (body instanceof FormData) {
        fetchOptions.body = body;
        // Don't set Content-Type for FormData, let fetch set it with boundary
      } else if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }
    }

    console.log(`[PROXY] ${method} ${url}`);
    
    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (fetchError) {
      // Network error - backend is likely not running or unreachable
      console.error('[PROXY] Fetch failed:', {
        url,
        error: fetchError.message,
        code: fetchError.code,
        backendUrl: BACKEND_URL,
      });
      
      // Provide more helpful error message
      let errorMessage = 'Backend server is not reachable';
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message.includes('ECONNREFUSED')) {
        errorMessage = `Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`;
      } else if (fetchError.message.includes('fetch failed')) {
        errorMessage = `Failed to connect to backend at ${BACKEND_URL}. Check if the server is running and accessible.`;
      } else {
        errorMessage = `Network error: ${fetchError.message}`;
      }
      
      return NextResponse.json(
        { 
          error: 'Proxy request failed', 
          message: errorMessage,
          details: {
            backendUrl: BACKEND_URL,
            endpoint: apiPath,
            originalError: fetchError.message,
          }
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Get response data
    const responseContentType = response.headers.get('content-type');
    let data;
    try {
      if (responseContentType && responseContentType.includes('application/json')) {
        data = await response.json();
      } else if (responseContentType && (responseContentType.includes('application/octet-stream') || responseContentType.includes('application/zip'))) {
        // Handle binary responses (downloads)
        data = await response.blob();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      console.error('[PROXY] Error parsing response:', parseError);
      data = { error: 'Failed to parse response', status: response.status };
    }

    // Create response with CORS headers
    const nextResponse = data instanceof Blob
      ? new NextResponse(data, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        })
      : NextResponse.json(data, {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });

    return nextResponse;
  } catch (error) {
    console.error('[PROXY] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy request failed', 
        message: error.message || 'An unexpected error occurred',
        details: {
          backendUrl: BACKEND_URL,
          errorType: error.constructor.name,
        }
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
