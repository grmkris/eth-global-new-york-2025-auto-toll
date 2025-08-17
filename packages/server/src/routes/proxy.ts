import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { paymentMiddleware } from 'x402-hono';
import { db } from '../db/index';
import { endpoints } from '../db/schema';
import { env } from '../env';
import { injectAuth } from '../services/proxy-service';

const app = new Hono();

// Free proxy endpoint (for testing)
app.all('/proxy/:id/*', async (c) => {
  const id = c.req.param('id');
  console.log(`\n🔄 [PROXY] Free proxy request to: /proxy/${id}`);

  try {
    const path = c.req.path.replace(`/proxy/${id}`, '');
    const queryString = c.req.url.split('?')[1] || '';

    // Get endpoint from DB
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id),
    });

    if (!endpoint) {
      console.error(`❌ [PROXY] Endpoint not found: ${id}`);
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    console.log(`   📌 API: ${endpoint.name}`);
    console.log(`   🔗 Forwarding to: ${endpoint.targetUrl}${path}${queryString ? '?' + queryString : ''}`);

    // Build target URL with path and query
    const targetUrl = endpoint.targetUrl + path + (queryString ? '?' + queryString : '');

    // Prepare request options
    const options: RequestInit = {
      method: c.req.method,
      headers: new Headers(),
    };

    // Forward headers (excluding host and Hono-specific headers)
    const headers = c.req.header();
    const skipHeaders = ['host', 'content-length', 'transfer-encoding', 'connection'];
    Object.keys(headers).forEach((key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        (options.headers as Headers).set(key, headers[key]);
      }
    });

    // Forward body if present
    const contentType = c.req.header('content-type');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
      if (contentType?.includes('application/json')) {
        options.body = await c.req.text();
      } else if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
        options.body = await c.req.arrayBuffer();
      } else {
        options.body = await c.req.arrayBuffer();
      }
    }

    // Inject auth
    const { targetUrl: finalUrl, options: finalOptions } = await injectAuth(
      targetUrl,
      options,
      endpoint
    );

    // Make the request
    const response = await fetch(finalUrl, finalOptions);

    console.log(`   ✅ Response: ${response.status} ${response.statusText}`);

    // Forward all response headers (except those that shouldn't be forwarded)
    const responseHeaders: Record<string, string> = {};
    const skipResponseHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
    response.headers.forEach((value, key) => {
      if (!skipResponseHeaders.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // Handle response based on content type
    const responseContentType = response.headers.get('content-type');
    if (responseContentType?.includes('application/json') || responseContentType?.includes('text/')) {
      const responseBody = await response.text();
      return c.text(
        responseBody,
        response.status as ContentfulStatusCode,
        responseHeaders
      );
    } else {
      // Binary content - stream it
      const responseBody = await response.arrayBuffer();
      return c.body(
        responseBody,
        response.status as ContentfulStatusCode,
        responseHeaders
      );
    }
  } catch (error) {
    console.error('❌ [PROXY] Request failed:', error);
    return c.json({ error: 'Proxy request failed' }, 500);
  }
});

// Apply x402 payment middleware for paid endpoints
app.use('/paid-proxy/:id/*', async (c, next) => {
  const id = c.req.param('id');
  console.log(`\n💳 [PAYMENT] x402 payment middleware for: /paid-proxy/${id}`);

  if (!id) {
    console.error('❌ [PAYMENT] Invalid endpoint ID');
    return c.json({ error: 'Invalid endpoint' }, 404);
  }

  // Get endpoint to find payment recipient
  const endpoint = await db.query.endpoints.findFirst({
    where: eq(endpoints.id, id),
  });

  if (!(endpoint && endpoint.requiresPayment && endpoint.walletAddress)) {
    console.log('   ⚠️  [PAYMENT] No payment required for this endpoint');
    return next();
  }

  console.log(`   📌 API: ${endpoint.name}`);
  console.log(`   💰 Price: ${endpoint.price}`);
  console.log(`   📍 Recipient: ${endpoint.walletAddress}`);

  // Apply x402 payment middleware
  const middleware = paymentMiddleware(
    endpoint.walletAddress,
    {
      [`/paid-proxy/${id}`]: {
        price: endpoint.price,
        network: env.NETWORK,
        config: {
          description: `Payment for ${endpoint.name} API`,
        },
      },
    },
    {
      url: env.FACILITATOR_URL,
    }
  );

  return middleware(c, next);
});

app.all('/paid-proxy/:id/*', async (c) => {
  const id = c.req.param('id');
  console.log(
    `\n✅ [PAID-PROXY] Payment verified, processing request for: /paid-proxy/${id}`
  );

  try {
    const path = c.req.path.replace(`/paid-proxy/${id}`, '');
    const queryString = c.req.url.split('?')[1] || '';

    // Get endpoint from DB
    const endpoint = await db.query.endpoints.findFirst({
      where: eq(endpoints.id, id),
    });

    if (!endpoint) {
      console.error(`❌ [PAID-PROXY] Endpoint not found: ${id}`);
      return c.json({ error: 'Endpoint not found' }, 404);
    }

    console.log(`   📌 API: ${endpoint.name}`);
    console.log(`   🔗 Forwarding to: ${endpoint.targetUrl}${path}${queryString ? '?' + queryString : ''}`);

    // Payment is now handled by x402 middleware above

    // Build target URL with path and query
    const targetUrl = endpoint.targetUrl + path + (queryString ? '?' + queryString : '');

    // Prepare request options
    const options: RequestInit = {
      method: c.req.method,
      headers: new Headers(),
    };

    // Forward headers (excluding host and Hono-specific headers)
    const headers = c.req.header();
    const skipHeaders = ['host', 'content-length', 'transfer-encoding', 'connection'];
    for (const key in headers) {
      if (!skipHeaders.includes(key.toLowerCase())) {
        (options.headers as Headers).set(key, headers[key]);
      }
    }

    // Forward body if present
    const contentType = c.req.header('content-type');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) {
      if (contentType?.includes('application/json')) {
        options.body = await c.req.text();
      } else if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
        options.body = await c.req.arrayBuffer();
      } else {
        options.body = await c.req.arrayBuffer();
      }
    }

    // Inject auth
    const { targetUrl: finalUrl, options: finalOptions } = await injectAuth(
      targetUrl,
      options,
      endpoint
    );

    // Make the request
    const response = await fetch(finalUrl, finalOptions);

    console.log(`   ✅ Response: ${response.status} ${response.statusText}`);

    // Forward all response headers (except those that shouldn't be forwarded)
    const responseHeaders: Record<string, string> = {};
    const skipResponseHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
    response.headers.forEach((value, key) => {
      if (!skipResponseHeaders.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // Handle response based on content type
    const responseContentType = response.headers.get('content-type');
    if (responseContentType?.includes('application/json') || responseContentType?.includes('text/')) {
      const responseBody = await response.text();
      return c.text(
        responseBody,
        response.status as ContentfulStatusCode,
        responseHeaders
      );
    } else {
      // Binary content - stream it
      const responseBody = await response.arrayBuffer();
      return c.body(
        responseBody,
        response.status as ContentfulStatusCode,
        responseHeaders
      );
    }
  } catch (error) {
    console.error('❌ [PROXY] Request failed:', error);
    return c.json({ error: 'Proxy request failed' }, 500);
  }
});

export default app;
