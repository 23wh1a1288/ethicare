import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to, subject, body, type } = await req.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      // Send real email via Resend
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ethicare <notifications@ethicare.ai>",
          to: [to],
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ ETHICARE</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 12px;">Protecting Your Identity in the AI Era</p>
              </div>
              <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                <h2 style="color: #0f172a; margin-top: 0;">${subject}</h2>
                <div style="color: #334155; line-height: 1.6;">${body}</div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated notification from Ethicare. Do not reply to this email.</p>
              </div>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Resend error:", errText);
        return new Response(JSON.stringify({ 
          success: false, 
          method: "resend_error",
          error: errText,
          message: "Email sending failed. Notification logged." 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const emailData = await emailResponse.json();
      return new Response(JSON.stringify({ 
        success: true, 
        method: "resend",
        emailId: emailData.id,
        message: `Email sent to ${to}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // No email provider configured - log and return simulation
      console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject} | Type: ${type}`);
      console.log(`[EMAIL BODY] ${body}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        method: "simulation",
        message: `Email notification simulated for ${to}. Configure RESEND_API_KEY for real delivery.` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("send-notification error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
