# Backend for Frontend (BFF)

This folder implements a lightweight **Backend for Frontend (BFF)** layer that
acts as the integration point between the frontend application and external
services. Instead of the frontend calling external APIs directly, all requests
are routed through this layer to provide a consistent and secure interface.

## Purpose

The BFF pattern is used here to:

-   **Abstract external services**: The frontend communicates only with this
    layer, while the BFF handles details such as API endpoints, authentication
    flows, and request formatting.
-   **Enforce security**: Sensitive logic (e.g., handling tokens) is kept out of
    the frontend.
-   **Simplify client code**: The BFF exposes a clean API tailored to the needs
    of the frontend, reducing boilerplate.
-   **Enable flexibility**: External APIs can be swapped or upgraded without
    requiring major frontend changes.

## Files

-   **`api.ts`**  
    Contains shared utilities for making HTTP requests. It centralizes
    configuration such as base URLs, headers, and error handling so that all API
    calls follow the same conventions.

-   **`auth.ts`**  
    Handles authentication-related operations, including login, signup, token
    management, and session persistence. It builds on `api.ts` to provide
    higher-level functions specific to authentication.

## Usage

Frontend components should import functions from this folder instead of calling
external services directly. This ensures that all communication flows through
the BFF, making the application easier to maintain and extend.

Example:

```ts
import { login } from "./auth";

async function handleLogin(email: string, password: string) {
    const user = await login(email, password);
    console.log("Authenticated user:", user);
}
```
