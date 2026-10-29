// Netlify event functions verify the platform JWS before invocation.
// Keep the filename: submission-created is an event-only entry point.
const API = "https://api.brevo.com/v3";
export function classify(payload, site) {
  if (!payload || !payload.id || !payload.created_at || !payload.data) return null;
  const d = payload.data;
  if (d["bot-field"]) return null;
  const form = payload.form_name || d["form-name"];
  if (site === "lifequestapp" && form === "join-life-quest") {
    if (d.marketing_consent !== "yes" || !d.consent_version) return null;
    return {email:d.email, list:3, source:"lifequestapp.ca / join-life-quest", consent:d.consent_version, name:""};
  }
  if (site === "dynamic-youtiao-51bddd" && form === "company-updates" && d.marketing_consent === "yes" && d.consent_version) {
    return {email:d.email,list:8,source:"simicsolutions.com / company-updates",consent:d.consent_version,name:""};
  }
  if (site === "dynamic-youtiao-51bddd" && form === "project-intake" && d["Permission to contact"] === "Yes") {
    return {email:d.Email, list:null, source:"simicsolutions.com / project-intake", name:d.Name || "", inquiry:true};
  }
  return null;
}
export async function sync(payload, {site, key, request=fetch}) {
  const item = classify(payload, site);
  if (!item) return {status:"ignored"};
  const email = String(item.email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {status:"invalid_email"};
  if (!key) throw new Error("Brevo connection is not configured");
  async function call(method, path, body) {
    for (let n=0; n<3; n++) {
      const res=await request(API+path,{method,headers:{"api-key":key,"Content-Type":"application/json","Accept":"application/json"},body:body ? JSON.stringify(body):undefined,signal:AbortSignal.timeout(8000)});
      if ((res.status === 429 || res.status >= 500) && n<2) {await new Promise(r=>setTimeout(r,300*(n+1)));continue;}
      if (res.status === 404) return {missing:true};
      if (res.status === 400 && method === "POST") return {conflict:true};
      if (!res.ok) throw new Error("Brevo request failed: "+res.status);
      return res.status === 204 ? {} : res.json();
    }
  }
  const path="/contacts/"+encodeURIComponent(email);
  let existing=await call("GET",path);
  const attributes={CONTACT_SOURCE:item.source};
  if (item.consent) attributes.CONSENT_EVIDENCE=JSON.stringify({form:payload.form_name || payload.data["form-name"],submission:payload.id,at:payload.created_at,version:item.consent,scope:item.list === 3 ? "Life Quest email updates" : "Simic Solutions email updates"});
  if (item.inquiry) {
    attributes.RELATIONSHIP_TYPE="Prospect";
    attributes.CONSENT_EVIDENCE=JSON.stringify({form:"project-intake",submission:payload.id,at:payload.created_at,scope:"Respond to this project request only; no promotional consent"});
    const parts=item.name.trim().split(/\s+/).filter(Boolean);
    if(parts.length) attributes.FIRSTNAME=parts.shift();
    if(parts.length) attributes.LASTNAME=parts.join(" ");
  }
  if (existing.missing) {
    const created=await call("POST","/contacts",{email,attributes,...(item.list ? {listIds:[item.list]} : {}),updateEnabled:false});
    if (!created.conflict) return {status:item.list ? "subscribed" : "inquiry_saved"};
    existing=await call("GET",path);
    if (existing.missing) throw new Error("Brevo contact creation failed");
  }
  // Never clear suppression, overwrite existing provenance, or reset a client relationship.
  if (item.list && existing.emailBlacklisted) return {status:"suppressed"};
  if (item.list && (existing.listIds || []).includes(item.list)) return {status:"already_subscribed"};
  const missingAttributes=Object.fromEntries(Object.entries(attributes).filter(([k])=>!existing.attributes?.[k]));
  if (item.consent && existing.attributes?.CONSENT_EVIDENCE) {
    // Preserve earlier permission evidence while retaining this separate product opt-in.
    missingAttributes.CONSENT_EVIDENCE=existing.attributes.CONSENT_EVIDENCE+"\n"+attributes.CONSENT_EVIDENCE;
  }
  if (Object.keys(missingAttributes).length || item.list) await call("PUT",path,{attributes:missingAttributes,...(item.list ? {listIds:[item.list]} : {})});
  return {status:item.list ? "subscribed" : "inquiry_saved"};
}
export const handler=async event=>{
  if (process.env.BREVO_SYNC_ENABLED !== "true") return {statusCode:200,body:"Preview: no contact synchronization"};
  const {payload}=JSON.parse(event.body || "{}");
  const result=await sync(payload,{site:process.env.SITE_NAME,key:process.env.BREVO_API_KEY});
  // Status only: no addresses, API responses, message bodies or keys in logs.
  console.info("brevo_intake",payload?.id || "missing_id",result.status);
  return {statusCode:200,body:result.status};
};
