// ==============================================================================
// SEREIN-GE : Edge Function Supabase pour l'envoi d'emails transactionnels
// (confirmation de commande, confirmation de candidature) via SMTP.
//
// Envoie deux emails à chaque appel :
//   1. Une confirmation formatée en HTML au client (commande ou candidature)
//   2. Une notification interne à l'équipe SEREIN-GE
//
// Nécessite les secrets SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
// SMTP_FROM et NOTIFICATION_EMAIL (voir supabase/functions/.env.example).
// Sans ces secrets, la fonction répond 200 avec skipped:true plutôt que
// d'échouer bruyamment — l'email est un best-effort, jamais un blocage pour
// la commande/candidature elle-même côté client.
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.14";

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "587");
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") ?? "";
const SMTP_FROM = Deno.env.get("SMTP_FROM") ?? SMTP_USER;
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") ?? "";
const COMPANY_NAME = "SEREIN-GE";
const COMPANY_LOGO_URL = Deno.env.get("COMPANY_LOGO_URL") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

function emailShell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background: #f4f1ea; padding: 32px 16px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e2dc;">
      <div style="background: #14110c; padding: 24px 32px; text-align: center;">
        ${COMPANY_LOGO_URL ? `<img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" style="height: 40px; margin-bottom: 8px;" />` : ''}
        <div style="color: #ffffff; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${COMPANY_NAME}</div>
        <div style="color: #9c9587; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Ingénierie & Géomatique</div>
      </div>
      <div style="padding: 32px;">
        <h1 style="font-size: 18px; color: #14110c; margin: 0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="background: #f7f7f5; padding: 20px 32px; font-size: 11px; color: #736c5e; border-top: 1px solid #e5e2dc;">
        <strong>${COMPANY_NAME}</strong> — Société d'Études, de Recherches, d'Expertise et d'Ingénierie Géomatique<br />
        Avenue Pascal ZAGRÉ, Ouaga 2000, Ouagadougou, Burkina Faso<br />
        +226 25 30 00 00 &middot; contact@serein-ge.bf
      </div>
    </div>
  </div>`;
}

function orderCustomerEmail(data: any): { subject: string; html: string } {
  const itemsRows = (data.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e2dc; font-size: 13px; color: #1a1712;">${item.nom} &times; ${item.quantite}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e2dc; font-size: 13px; color: #1a1712; text-align: right;">${formatFCFA(item.prixUnitaireFcfa * item.quantite)}</td>
      </tr>`
    )
    .join("");

  const html = emailShell(
    "Confirmation de votre commande",
    `
      <p style="font-size: 13px; color: #1a1712; line-height: 1.6;">
        Bonjour ${data.clientNom},<br /><br />
        Nous avons bien reçu votre commande <strong>${data.reference}</strong>. Un conseiller technique ${COMPANY_NAME} vous contactera prochainement pour organiser le règlement et la livraison ou le retrait au showroom.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${itemsRows}
        <tr>
          <td style="padding: 12px 0 0; font-size: 14px; font-weight: bold; color: #14110c;">Total</td>
          <td style="padding: 12px 0 0; font-size: 14px; font-weight: bold; color: #14110c; text-align: right;">${formatFCFA(data.totalFcfa)}</td>
        </tr>
      </table>
    `
  );

  return { subject: `Confirmation de commande ${data.reference} — ${COMPANY_NAME}`, html };
}

function orderNotificationEmail(data: any): { subject: string; html: string } {
  const itemsRows = (data.items || [])
    .map((item: any) => `<li>${item.nom} &times; ${item.quantite} — ${formatFCFA(item.prixUnitaireFcfa * item.quantite)}</li>`)
    .join("");

  const html = emailShell(
    "Nouvelle commande reçue",
    `
      <p style="font-size: 13px; color: #1a1712;"><strong>Référence :</strong> ${data.reference}</p>
      <p style="font-size: 13px; color: #1a1712;"><strong>Client :</strong> ${data.clientNom}<br />
      <strong>Téléphone :</strong> ${data.clientTelephone}<br />
      <strong>Email :</strong> ${data.clientEmail}</p>
      <ul style="font-size: 13px; color: #1a1712;">${itemsRows}</ul>
      <p style="font-size: 14px; font-weight: bold; color: #14110c;">Total : ${formatFCFA(data.totalFcfa)}</p>
    `
  );

  return { subject: `Nouvelle commande ${data.reference}`, html };
}

function applicationCustomerEmail(data: any): { subject: string; html: string } {
  const html = emailShell(
    "Confirmation de votre candidature",
    `
      <p style="font-size: 13px; color: #1a1712; line-height: 1.6;">
        Bonjour ${data.prenom} ${data.nom},<br /><br />
        Nous avons bien reçu votre candidature pour le poste de <strong>${data.posteSouhaite}</strong>. Notre équipe RH étudiera votre dossier et reviendra vers vous prochainement.
      </p>
    `
  );
  return { subject: `Candidature reçue — ${COMPANY_NAME}`, html };
}

function applicationNotificationEmail(data: any): { subject: string; html: string } {
  const html = emailShell(
    "Nouvelle candidature reçue",
    `
      <p style="font-size: 13px; color: #1a1712;"><strong>Poste :</strong> ${data.posteSouhaite}<br />
      <strong>Candidat :</strong> ${data.civilite || ''} ${data.prenom} ${data.nom}<br />
      <strong>Téléphone :</strong> ${data.telephone}<br />
      <strong>Email :</strong> ${data.email}</p>
    `
  );
  return { subject: `Nouvelle candidature : ${data.posteSouhaite}`, html };
}

function quoteCustomerEmail(data: any): { subject: string; html: string } {
  const html = emailShell(
    "Confirmation de votre demande de devis",
    `
      <p style="font-size: 13px; color: #1a1712; line-height: 1.6;">
        Bonjour ${data.prenom} ${data.nom},<br /><br />
        Nous avons bien reçu votre demande de devis <strong>${data.reference}</strong> pour la prestation <strong>${data.posteSouhaite}</strong>. Nos ingénieurs analysent votre besoin et vous recontacteront sous 24h ouvrées avec une proposition technique et financière.
      </p>
    `
  );
  return { subject: `Demande de devis reçue ${data.reference} — ${COMPANY_NAME}`, html };
}

function quoteNotificationEmail(data: any): { subject: string; html: string } {
  const html = emailShell(
    "Nouvelle demande de devis reçue",
    `
      <p style="font-size: 13px; color: #1a1712;"><strong>Référence :</strong> ${data.reference}<br />
      <strong>Prestation :</strong> ${data.posteSouhaite}<br />
      <strong>Client :</strong> ${data.prenom} ${data.nom}<br />
      <strong>Téléphone :</strong> ${data.telephone}<br />
      <strong>Email :</strong> ${data.email}</p>
    `
  );
  return { subject: `Nouvelle demande de devis ${data.reference}`, html };
}

async function sendMail(transporter: nodemailer.Transporter, to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      console.warn("SMTP non configuré : email ignoré (voir supabase/functions/.env.example)");
      return jsonResponse({ skipped: true, reason: "SMTP not configured" });
    }

    const body = await req.json();
    const { type } = body;

    let customerEmail: { subject: string; html: string } | null = null;
    let customerAddress = "";

    if (type === "order") {
      customerEmail = orderCustomerEmail(body);
      customerAddress = body.clientEmail;
    } else if (type === "application") {
      customerEmail = applicationCustomerEmail(body);
      customerAddress = body.email;
    } else if (type === "quote") {
      customerEmail = quoteCustomerEmail(body);
      customerAddress = body.email;
    } else {
      return jsonResponse({ error: "type doit être 'order', 'application' ou 'quote'" }, 400);
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });

    if (customerAddress && customerEmail) {
      await sendMail(transporter, customerAddress, customerEmail.subject, customerEmail.html);
    }

    if (NOTIFICATION_EMAIL) {
      const internal = type === "order"
        ? orderNotificationEmail(body)
        : type === "quote"
        ? quoteNotificationEmail(body)
        : applicationNotificationEmail(body);
      await sendMail(transporter, NOTIFICATION_EMAIL, internal.subject, internal.html);
    }

    return jsonResponse({ success: true });
  } catch (err: any) {
    console.error("Error sending notification email:", err);
    return jsonResponse({ error: err.message }, 500);
  }
});
