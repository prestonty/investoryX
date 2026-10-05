// Mirrors the backend rule in investoryx-backend/src/routes/auth.py (UserCreate.password_policy).
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULE_TEXT = `At least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`;

// Returns a user-facing error, or null when the password satisfies the policy.
export function passwordPolicyError(password: string): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (!/[A-Za-z]/.test(password)) {
        return "Password must contain at least one letter";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number";
    }
    return null;
}
