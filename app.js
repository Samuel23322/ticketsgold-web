const data=[
 {cat:"football",date:"25 OCT 2026",name:"Real Madrid vs FC Barcelona",venue:"Santiago Bernabéu · Madrid",price:"120 €"},
 {cat:"football",date:"08 NOV 2026",name:"Real Madrid vs Atlético de Madrid",venue:"Santiago Bernabéu · Madrid",price:"85 €"},
 {cat:"football",date:"25 NOV 2026",name:"Real Madrid · Champions League",venue:"Santiago Bernabéu · Madrid",price:"95 €"},
 {cat:"concert",date:"14 NOV 2026",name:"Gran concierto · Madrid",venue:"Madrid",price:"65 €"},
 {cat:"other",date:"05 DIC 2026",name:"Evento deportivo",venue:"Madrid",price:"40 €"},
 {cat:"concert",date:"19 DIC 2026",name:"Live Music Night",venue:"Madrid",price:"55 €"}
];

const SUPABASE_URL = "https://frmhsqarbmthpkgfobdr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1eI48cMtpfmqIfbR3TF8fg_x1NKL3CH";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;
const events=document.querySelector("#events"), toast=document.querySelector("#toast");
function render(list){events.innerHTML=list.map(e=>`<article class="event"><div class="event-art ${e.cat==="concert"?"concert":""}"><span class="event-tag">${e.cat==="football"?"FÚTBOL":e.cat==="concert"?"CONCIERTO":"EVENTO"}</span></div><div class="event-body"><div class="event-date">${e.date}</div><h3>${e.name}</h3><p>${e.venue}</p><div class="event-foot"><div class="from">Desde<b>${e.price}</b></div><button class="buy" onclick="show('La ficha de ${e.name} estará disponible en la versión conectada.')">Ver entradas</button></div></div></article>`).join("")}
render(data);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");const c=b.dataset.cat;render(c==="all"?data:data.filter(x=>x.cat===c))}));
document.querySelector("#searchBtn").onclick=()=>{const q=document.querySelector("#search").value.toLowerCase();render(data.filter(x=>(x.name+x.venue+x.cat).toLowerCase().includes(q)));document.querySelector("#eventos").scrollIntoView()};
document.querySelector("#search").addEventListener("keydown",e=>{if(e.key==="Enter")document.querySelector("#searchBtn").click()});

const overlay=document.querySelector("#authOverlay"), authForm=document.querySelector("#authForm"), authEmail=document.querySelector("#authEmail"), authPassword=document.querySelector("#authPassword");
const authTitle=document.querySelector("#authTitle"), authSubtitle=document.querySelector("#authSubtitle"), authSubmit=document.querySelector("#authSubmit"), authSwitch=document.querySelector("#authSwitch"), authStatus=document.querySelector("#authStatus");
let registerMode=false;

function openAuth(mode=false){
  registerMode=mode; updateAuthUI(); authStatus.textContent=""; overlay.classList.add("show"); overlay.setAttribute("aria-hidden","false"); setTimeout(()=>authEmail.focus(),50);
}
function closeAuth(){overlay.classList.remove("show");overlay.setAttribute("aria-hidden","true")}
function updateAuthUI(){
  authTitle.textContent=registerMode?"Crear cuenta":"Iniciar sesión";
  authSubtitle.textContent=registerMode?"Crea tu cuenta gratuita en TicketsGold.":"Accede a tu cuenta para comprar o gestionar tus entradas.";
  authSubmit.textContent=registerMode?"Registrarme":"Iniciar sesión";
  authSwitch.textContent=registerMode?"¿Ya tienes cuenta? Inicia sesión":"¿No tienes cuenta? Regístrate";
}
document.querySelector("#loginBtn").onclick=()=>openAuth(false);
document.querySelector("#authClose").onclick=closeAuth;
overlay.addEventListener("click",e=>{if(e.target===overlay)closeAuth()});
authSwitch.onclick=()=>{registerMode=!registerMode;authStatus.textContent="";updateAuthUI()};

authForm.onsubmit=async e=>{
  e.preventDefault(); authStatus.textContent="Procesando…"; authSubmit.disabled=true;
  const email=authEmail.value.trim(), password=authPassword.value;
  try{
    let result;
    if(registerMode){
      result=await supabaseClient.auth.signUp({email,password});
      if(result.error) throw result.error;
      authStatus.textContent="Cuenta creada. Si Supabase solicita confirmación por email, revisa tu correo.";
    }else{
      result=await supabaseClient.auth.signInWithPassword({email,password});
      if(result.error) throw result.error;
      authStatus.textContent="Sesión iniciada correctamente.";
      setTimeout(closeAuth,900);
    }
  }catch(err){
    authStatus.textContent=err?.message||"No se pudo completar la operación.";
  }finally{authSubmit.disabled=false}
};

document.querySelector("#sellBtn").onclick=()=>show("Para publicar entradas necesitaremos completar el perfil del vendedor y la verificación en el siguiente paso.");
document.querySelector("#newsletter").onsubmit=e=>{e.preventDefault();show("¡Listo! Te avisaremos cuando esta función esté conectada.");e.target.reset()};
function show(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3200)}

supabaseClient.auth.getSession().then(({data:{session}})=>{ if(session) document.querySelector("#loginBtn").textContent="Mi cuenta"; });
supabaseClient.auth.onAuthStateChange((_event,session)=>{ document.querySelector("#loginBtn").textContent=session?"Mi cuenta":"Iniciar sesión"; });
