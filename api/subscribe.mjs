const allowedOrigins=new Set(["https://earlyaccess.acf.gold","https://meg-acfp-ltd.github.io"]);
function reply(payload,status,origin){const h={"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};if(allowedOrigins.has(origin))h["Access-Control-Allow-Origin"]=origin;return new Response(JSON.stringify(payload),{status,headers:h});}
export default {async fetch(request){
 const origin=request.headers.get("origin")||"";
 if(request.method==="OPTIONS")return allowedOrigins.has(origin)?new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"}}):reply({error:"Origin not allowed"},403,origin);
 if(request.method==="GET")return reply({service:"ACF Club Early Access DOI",configured:!!process.env.BREVO_API_KEY},200,origin);
 if(request.method!=="POST")return reply({error:"Method not allowed"},405,origin);
 if(!allowedOrigins.has(origin))return reply({error:"Origin not allowed"},403,origin);
 if(!process.env.BREVO_API_KEY)return reply({error:"Confirmation service is not configured yet. Please try again later."},503,origin);
 let data;try{const raw=await request.text();if(raw.length>5000)return reply({error:"Request too large"},413,origin);data=JSON.parse(raw);}catch{return reply({error:"Invalid request"},400,origin);}
 if(data.website)return reply({message:"If this address is eligible, a confirmation email will arrive shortly."},202,origin);
 const firstName=String(data.firstName||"").trim(),email=String(data.email||"").trim().toLowerCase(),postcode=String(data.postcode||"").trim();
 if(!firstName||firstName.length>80||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>254||!/^\d{4}$/.test(postcode)||data.consent!==true)return reply({error:"Please enter valid details and agree to receive a verification email."},400,origin);
 let result;try{result=await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation",{method:"POST",headers:{"api-key":process.env.BREVO_API_KEY,"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify({email,includeListIds:[38],templateId:115,redirectionUrl:"https://earlyaccess.acf.gold/confirmed.html",contactPixelTrackingConsent:false,attributes:{FIRSTNAME:firstName,EARLY_ACCESS_POSTCODE:postcode,CONTACT_SOURCE:"ACF Club Early Access"}}),signal:AbortSignal.timeout(12000)});}catch(err){console.error("Brevo DOI failure",err?.name||"error");return reply({error:"The confirmation request could not be sent. Please try again."},502,origin);}
 if(!result.ok){console.error("Brevo DOI HTTP status",result.status);return reply({error:"The confirmation request could not be sent. Please try again."},502,origin);}
 return reply({message:"Check your email and click the confirmation link to join the wait-list."},202,origin);
}};