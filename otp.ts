/**
 * Mask a 10-digit Indian phone number, showing only the last 5 digits.
 * Example: 9876525343 -> *****25343
 * If the input is not a valid 10-digit number, returns a masked fallback.
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return '*****' + digits.slice(-5);
  }
  // For shorter numbers, mask all but last 2
  return '*'.repeat(Math.max(digits.length - 2, 0)) + digits.slice(-2);
}

/**
 * Validate that a phone number is exactly 10 digits (Indian mobile format).
 */
export function isValidIndianPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Sanitize a phone number to exactly 10 digits, stripping non-digits.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 10);
}

/**
 * Generate a 6-digit OTP code.
 */
export function genOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Request an OTP to be sent to the patient's personal phone number.
 * Calls the send-otp edge function.
 *
 * - Real SMS mode (TWO_FACTOR_API configured): OTP is sent via 2Factor SMS API.
 *   The OTP is NEVER returned to the frontend.
 * - Demo mode (no SMS provider configured): OTP is stored in the database and
 *   returned as demoCode so it can be displayed for the science-exhibition demo.
 */
export async function requestOtp(
  patientMedId: string,
  phone: string,
  purpose: string = 'patient_access'
): Promise<{ success: boolean; demoMode: boolean; smsSent?: boolean; demoCode?: string; error?: string }> {
  try {
    const baseUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
    const anonKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      return { success: false, demoMode: true, error: 'Supabase not configured' };
    }

    const res = await fetch(`${baseUrl}/functions/v1/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ patient_med_id: patientMedId, phone, purpose }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, demoMode: true, error: data.error || 'Failed to send OTP' };
    }

    const demoMode = data.demo_mode === true;
    const smsSent = data.sms_sent === true;

    // In real SMS mode, if the SMS failed to send, surface a clean error.
    if (!demoMode && !smsSent) {
      return {
        success: false,
        demoMode: false,
        error: 'We couldn\'t send the OTP right now. Please try again.',
      };
    }

    // Demo code is only ever returned in demo mode.
    return {
      success: true,
      demoMode,
      smsSent,
      demoCode: demoMode ? data.demo_code : undefined,
    };
  } catch {
    return { success: false, demoMode: true, error: 'Network error' };
  }
}

/**
 * Verify an OTP code against the database via the verify-otp edge function.
 */
export async function verifyOtp(
  patientMedId: string,
  code: string,
  purpose: string = 'patient_access'
): Promise<{ verified: boolean; error?: string }> {
  try {
    const baseUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
    const anonKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      return { verified: false, error: 'Supabase not configured' };
    }

    const res = await fetch(`${baseUrl}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ patient_med_id: patientMedId, code, purpose }),
    });

    const data = await res.json();
    return { verified: data.verified === true, error: data.error };
  } catch {
    return { verified: false, error: 'Network error' };
  }
}
