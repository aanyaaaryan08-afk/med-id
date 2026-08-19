import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { patient_med_id, code, purpose, phone } = await req.json();

    const otpPurpose = purpose || "patient_access";
    // For registration, use phone as the lookup key since there's no patient_med_id yet
    const lookupKey = patient_med_id || (otpPurpose === "registration" ? phone : null);

    if (!lookupKey || !code) {
      const msg = otpPurpose === "registration"
        ? "Please enter the OTP sent to your phone number."
        : "patient_med_id and code are required";
      return new Response(
        JSON.stringify({ verified: false, error: msg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch the latest unused, unverified OTP for this key
    const res = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?patient_med_id=eq.${encodeURIComponent(
        lookupKey
      )}&code=eq.${encodeURIComponent(code)}${
        purpose ? `&purpose=eq.${encodeURIComponent(otpPurpose)}` : ""
      }&consumed=eq.false&verified=eq.false&order=created_at.desc&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    const data = await res.json();

    if (!data || data.length === 0) {
      const msg = otpPurpose === "registration"
        ? "Incorrect OTP. Please try again."
        : "Invalid OTP. Please check and try again.";
      return new Response(
        JSON.stringify({ verified: false, error: msg }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const otpRecord = data[0];

    // For registration, verify the OTP belongs to the exact phone number provided
    if (otpPurpose === "registration" && phone && otpRecord.phone_used && otpRecord.phone_used !== phone) {
      return new Response(
        JSON.stringify({ verified: false, error: "Incorrect OTP. Please try again." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ verified: false, error: "This OTP has expired. Please request a new OTP." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as verified and consumed
    await fetch(`${supabaseUrl}/rest/v1/otp_codes?id=eq.${otpRecord.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        verified: true,
        consumed: true,
      }),
    });

    const successMsg = otpPurpose === "registration"
      ? "Phone number verified successfully."
      : "OTP verified successfully.";
    return new Response(
      JSON.stringify({ verified: true, message: successMsg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
