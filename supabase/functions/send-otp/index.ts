import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function genOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { patient_med_id, phone, purpose } = await req.json();

    if (!patient_med_id || !phone) {
      return new Response(
        JSON.stringify({ error: "patient_med_id and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twoFactorApi = Deno.env.get("TWO_FACTOR_API");

    const code = genOtp();
    const otpPurpose = purpose || "patient_access";

    // Insert OTP record into the database
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        patient_med_id,
        code,
        purpose: otpPurpose,
        phone_used: phone,
        verified: false,
        consumed: false,
      }),
    });

    if (!insertRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to store OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If TWO_FACTOR_API is configured, send real SMS via 2Factor.in
    if (twoFactorApi) {
      try {
        const smsRes = await fetch(
          `https://2factor.in/API/V1/${twoFactorApi}/SMS/+91${phone}/${code}`,
        );
        const smsData = await smsRes.json();

        if (smsData.Status === "Success") {
          return new Response(
            JSON.stringify({ demo_mode: false, sms_sent: true, message: "OTP sent via SMS" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        } else {
          return new Response(
            JSON.stringify({ demo_mode: false, sms_sent: false, error: "SMS provider error" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch {
        return new Response(
          JSON.stringify({ demo_mode: false, sms_sent: false, error: "SMS send failed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Demo mode — no SMS provider configured, return the code for display
    return new Response(
      JSON.stringify({ demo_mode: true, sms_sent: false, demo_code: code }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
