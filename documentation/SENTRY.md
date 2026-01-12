# Sentry Error Monitoring & Performance Tracking

## Overview

[Sentry](https://sentry.io) is an error tracking and performance monitoring platform integrated into the YC Directory project. It helps us capture, track, and resolve application errors in real-time across the frontend and backend.

## What is Sentry?

Sentry is an open-source error tracking platform that:
- **Captures Errors**: Automatically detects and logs errors in your application
- **Tracks Performance**: Monitors application performance and transaction times
- **Provides Replay**: Records user sessions to help debug issues
- **Manages Alerts**: Sends notifications when new errors occur
- **Groups Issues**: Automatically groups similar errors for easier management

## Setup & Configuration

### Installed Package

The project uses `@sentry/nextjs` v10.21.0, the official Sentry SDK for Next.js applications.

```json
"@sentry/nextjs": "^10.21.0"
```

### Configuration Files

#### 1. **Client Configuration** - [sentry.client.config.ts](../sentry.client.config.ts)

Runs in the browser on every page load. Handles frontend error tracking and user experience monitoring.

**Key Features:**
- **DSN**: Uses environment variable `NEXT_PUBLIC_SENTRY_DSN` for the Sentry project endpoint
- **Trace Sample Rate**: 1.0 (100%) - captures all traces
- **Replay Integration**: Records user sessions for debugging
- **Feedback Integration**: Collects user feedback on errors
- **Session Replays**: 10% normal sessions, 100% on error

```typescript
// Configuration includes:
- replayIntegration() - Session recording
- feedbackIntegration() - User feedback collection
- replaysSessionSampleRate: 0.1 (10% of sessions)
- replaysOnErrorSampleRate: 1.0 (100% when errors occur)
```

#### 2. **Server Configuration** - [sentry.server.config.ts](../sentry.server.config.ts)

Runs on Node.js servers. Handles backend/API error tracking.

**Key Features:**
- **DSN**: `https://ea479f63d7355da7bfd0438e661a4278@o4510237306388480.ingest.de.sentry.io/4510237310451792`
- **Trace Sample Rate**: 1.0 (100%)
- **Enable Logs**: true - captures application logs
- **Send Default PII**: true - includes user identification data

#### 3. **Edge Configuration** - [sentry.edge.config.ts](../sentry.edge.config.ts)

Runs in Next.js Edge Runtime (middleware, edge routes).

**Same settings as server configuration**
- Trace Sample Rate: 1.0
- Enable Logs: true
- Send Default PII: true

### Instrumentation Setup

#### Main Instrumentation - [instrumentation.ts](../instrumentation.ts)

Initializes Sentry for different runtime environments:

```typescript
export async function register() {
  // Load server config for Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Load edge config for Edge Runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Capture request errors from Next.js
export const onRequestError = Sentry.captureRequestError;
```

#### Client Instrumentation - [instrumentation-client.ts](../instrumentation-client.ts)

Initializes Sentry for client-side (browser) with replay and feedback features.

### Environment Variables

#### `.env.sentry-build-plugin`

Contains the `SENTRY_AUTH_TOKEN` used by the Sentry Build Plugin for:
- Uploading source maps
- Authenticating with Sentry during builds

**⚠️ Important**: This file should NOT be committed to version control (already in .gitignore)

#### Required Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project endpoint | Client (public) |
| `SENTRY_AUTH_TOKEN` | Build plugin authentication | Server (build time) |

## How Sentry is Used in the Project

### 1. Automatic Error Capture

Sentry automatically captures:
- **Unhandled exceptions** in frontend and backend code
- **Promise rejections** that aren't caught
- **API errors** and request failures
- **Performance issues** and slow transactions
- **Console errors** and warnings

### 2. Example Pages

#### Sentry Example Frontend Page - [sentry-example-page/page.tsx](../app/sentry-example-page/page.tsx)

A demo page for testing Sentry's frontend capabilities:

**Features:**
- Tests frontend error reporting
- Performs backend API calls
- Checks connectivity to Sentry servers
- Includes styled error messages and success indicators

**Custom Error Class:**
```typescript
class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}
```

**Usage:**
```typescript
// Throws and captures a frontend error
throw new SentryExampleFrontendError("This error is raised on the frontend...");
```

**Span Creation for Performance Tracking:**
```typescript
await Sentry.startSpan({
  name: 'Example Frontend/Backend Span',
  op: 'test'
}, async () => {
  const res = await fetch("/api/sentry-example-api");
  if (!res.ok) {
    setHasSentError(true);
  }
});
```

#### Sentry Example API Route - [api/sentry-example-api/route.ts](../app/api/sentry-example-api/route.ts)

A demo API endpoint for testing backend error reporting:

```typescript
class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

export function GET() {
  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page."
  );
  // Returns NextResponse.json({ data: "Testing Sentry Error..." });
}
```

### 3. Connectivity Checking

The example page includes SDK connectivity diagnostics:

```typescript
const result = await Sentry.diagnoseSdkConnectivity();
setIsConnected(result !== 'sentry-unreachable');
```

This helps identify if network requests to Sentry are blocked (e.g., by ad-blockers).

## Integration with Next.js

### Middleware & Edge Routes

Sentry automatically captures errors from:
- **Middleware** - runs on every request
- **Edge Runtime Routes** - lightweight functions at the edge
- **API Routes** - backend endpoints

### Custom Error Handling

For custom error handling, use Sentry's API:

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture an exception
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
}

// Capture a message
Sentry.captureMessage("Something went wrong", "error");

// Add context
Sentry.setContext("user_action", {
  action: "startup_creation",
  startup_id: "123"
});

// Add tags for filtering
Sentry.setTag("feature", "startup-form");
```

## Performance Monitoring

### Transaction Tracking

Track performance of specific operations:

```typescript
await Sentry.startSpan({
  name: 'Database Query',
  op: 'db.query'
}, async () => {
  // database operation
});
```

### Trace Sample Rate

- **Client**: 100% of traces are captured
- **Server**: 100% of traces are captured
- **Adjustments**: In production, reduce sample rates to save on quota

## Session Replays

Sentry automatically records user sessions to help debug issues:

- **Normal Sessions**: 10% of all sessions are recorded
- **Error Sessions**: 100% of sessions with errors are recorded
- **Data Captured**: User interactions, network requests, console logs, errors

## PII (Personally Identifiable Information)

The project has `sendDefaultPii: true` enabled, which means:
- **User information** is sent to Sentry
- **Useful for debugging** authentication and user-specific issues
- **Privacy consideration**: Ensure compliance with data privacy regulations

## Accessing Sentry Dashboard

- **Organization**: han-it
- **Project**: YC Directory (ID: 4510237310451792)
- **Dashboard**: https://han-it.sentry.io/issues/?project=4510237310451792

## Development Workflow

### Testing Sentry Locally

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the test page**:
   ```
   http://localhost:3000/sentry-example-page
   ```

3. **Click "Throw Sample Error"** to test error reporting

4. **View errors in Sentry Dashboard** (may take a few seconds to appear)

### Important Notes

- Errors are sampled and sent to Sentry even in development
- Ad-blockers may prevent Sentry from receiving error data
- The example API route intentionally throws errors for testing

## Best Practices

### ✅ Do's

1. **Use Custom Error Classes** - Makes errors easier to identify and filter
2. **Add Context** - Use `Sentry.setContext()` to add relevant information
3. **Use Tags** - Use `Sentry.setTag()` for filtering and grouping
4. **Monitor Critical Paths** - Track important user workflows
5. **Review Regularly** - Check the Sentry dashboard for patterns and trends

### ❌ Don'ts

1. **Don't Enable 100% Sample Rate in Production** - Use lower rates to manage costs
2. **Don't Log Sensitive Data** - Avoid sending passwords, tokens, or API keys
3. **Don't Ignore Errors** - Set up alerts for critical issues
4. **Don't Commit Auth Tokens** - Keep `.env.sentry-build-plugin` out of version control
5. **Don't Disable PII Stripping Lightly** - Be aware of privacy implications

## Configuration Adjustments

### For Production

```typescript
// Reduce trace sampling in production
tracesSampleRate: 0.1, // 10% instead of 100%

// Reduce replay sampling
replaysSessionSampleRate: 0.01, // 1% instead of 10%
replaysOnErrorSampleRate: 0.5, // 50% instead of 100%
```

### For Debugging

```typescript
// Enable debugging during troubleshooting
debug: true,

// Increase logging
enableLogs: true,

// Increase sample rates
tracesSampleRate: 1.0,
replaysSessionSampleRate: 1.0,
```

## Troubleshooting

### Errors Not Appearing in Sentry

**Possible causes:**
1. **Network blocked** - Ad-blocker or firewall blocking Sentry endpoints
2. **DSN misconfigured** - Check environment variables
3. **Sample rate is 0** - Errors are being dropped due to sampling
4. **Not in production/build** - Verify you're testing with a built version

**Solutions:**
1. Check browser console for network errors
2. Use `Sentry.diagnoseSdkConnectivity()` to test connectivity
3. Disable ad-blockers temporarily
4. Verify DSN is correct in Sentry dashboard

### High Costs or Quota Issues

**Solutions:**
1. Reduce `tracesSampleRate` (e.g., 0.1 instead of 1.0)
2. Reduce `replaysSessionSampleRate` (e.g., 0.01 instead of 0.1)
3. Use `tracesSampler` for more granular control
4. Set up error rate alerts to detect sudden spikes

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Project Dashboard](https://han-it.sentry.io)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/)
- [Performance Monitoring Guide](https://docs.sentry.io/platforms/javascript/performance/)
- [Session Replays Documentation](https://docs.sentry.io/platforms/javascript/session-replay/)

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - How authentication is implemented
- [Sanity CMS](./SANITY.md) - Content management setup
