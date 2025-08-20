// BFF

// Fetch stock history for candlestick charts
export async function getStockHistory(
    ticker: string,
    period: string = "1mo",
    interval: string = "1d",
) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`,
        {
            cache: "no-store",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch stock history");
    }

    return res.json();
}

// Fetch general stock information to populate stock page
export async function getStockPrice(ticker: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/stocks/${ticker}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch basic stock data");
    }

    return res.json();
}

export async function getStockOverview(ticker: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/stock-overview/${ticker}`,
        {
            cache: "no-store",
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch advanced stock data");
    }

    return res.json();
}

// AUTH API FUNCTIONS

export interface RegisterData {
    Name: string;
    email: string;
    password: string;
}

export interface LoginData {
    username: string; // FastAPI OAuth2PasswordRequestForm expects 'username' field
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    UserId: number;
    Name: string;
    email: string;
    is_active: boolean;
}

// Register a new user
export async function registerUser(
    userData: RegisterData,
): Promise<UserResponse> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        },
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Registration failed");
    }

    const user = await res.json();

    // Send verification email after successful registration
    try {
        await sendVerificationEmail(userData.email, userData.Name);
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Don't fail registration if email fails, just log it
    }
    return user;
}

// Send verification email
export async function sendVerificationEmail(
    email: string,
    firstName: string,
): Promise<void> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/send-sign-up-email`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                first_name: firstName,
                verification_url: `${
                    process.env.NEXT_PUBLIC_URL
                }/verify-email?email=${encodeURIComponent(email)}`,
            }),
        },
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to send verification email");
    }
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ message: string }> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/verify-email`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        },
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Email verification failed");
    }

    return res.json();
}

// Login user and get access token
export async function loginUser(loginData: LoginData): Promise<AuthResponse> {
    // FastAPI OAuth2PasswordRequestForm expects form data, not JSON
    const formData = new FormData();
    formData.append("username", loginData.username);
    formData.append("password", loginData.password);

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/token`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
    }

    return res.json();
}

// Get current user info (requires token)
export async function getCurrentUser(token: string): Promise<UserResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to get user info");
    }

    return res.json();
}
