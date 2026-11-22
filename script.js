// ── State ──
var S = { p:0, q:0, n:0, phi:0, e:0, d:0, ready:false };

// ── Math ──
function gcd(a,b){ return b===0?a:gcd(b,a%b); }
function modpow(base,exp,mod){
  var r=1n; base=BigInt(base)%BigInt(mod); exp=BigInt(exp); mod=BigInt(mod);
  while(exp>0n){ if(exp%2n===1n)r=r*base%mod; exp=exp/2n; base=base*base%mod; }
  return Number(r);
}
function modInverse(a,m){
  var or=a,r=m,os=1,s=0,q,t;
  while(r!==0){ q=Math.floor(or/r); t=r;r=or-q*r;or=t; t=s;s=os-q*s;os=t; }
  if(or!==1)return -1;
  return((os%m)+m)%m;
}

// ── UI ──
function showPanel(i){
  document.querySelectorAll('.panel').forEach(function(p,j){ p.classList.toggle('active',j===i); });
  document.querySelectorAll('.tab').forEach(function(b,j){ b.classList.toggle('active',j===i); });
}

function litStar(i){
  var s=document.getElementById('star'+i);
  if(s){ s.classList.add('lit'); }
}

function stepCard(icon,title,desc,math){
  return '<div class="step-card">'
    +'<div class="step-title">'+icon+' '+title+'</div>'
    +'<div class="step-desc">'+desc+'</div>'
    +(math?'<div class="step-math">» '+math+'</div>':'')
    +'</div>';
}

// ── Keys ──
function populateE(phi){
  var sel=document.getElementById('selE'); sel.innerHTML='';
  var c=0;
  for(var e=2;e<phi&&c<16;e++){
    if(gcd(e,phi)===1){
      var o=document.createElement('option'); o.value=e; o.textContent=e; sel.appendChild(o); c++;
    }
  }
  if(sel.options.length) sel.value=sel.options[0].value;
}

function onPrimeChange(){
  var p=parseInt(document.getElementById('selP').value);
  var q=parseInt(document.getElementById('selQ').value);
  if(p===q)return;
  populateE((p-1)*(q-1));
  computeKeys();
}

function computeKeys(){
  var p=parseInt(document.getElementById('selP').value);
  var q=parseInt(document.getElementById('selQ').value);
  var e=parseInt(document.getElementById('selE').value);
  var ks=document.getElementById('keySteps');

  if(p===q){ ks.innerHTML='<div class="warn-box">p and q must be different primes!</div>'; document.getElementById('keyBox').style.display='none'; return; }

  var n=p*q, phi=(p-1)*(q-1);
  if(n<=126){ ks.innerHTML='<div class="warn-box">n='+n+' is too small! choose bigger primes so n > 126</div>'; document.getElementById('keyBox').style.display='none'; return; }
  if(!e||gcd(e,phi)!==1)return;

  var d=modInverse(e,phi);
  S={p,q,n,phi,e,d,ready:true};

  document.getElementById('dispE').textContent=e;
  document.getElementById('dispN').textContent=n;
  document.getElementById('dispD').textContent=d;
  document.getElementById('dispN2').textContent=n;
  document.getElementById('dispPhi').textContent=phi;
  document.getElementById('keyBox').style.display='block';
  document.getElementById('goEncBtn').style.display='block';
  document.getElementById('tab0').classList.add('done');
  litStar(0);

  ks.innerHTML=
    stepCard('🌷','step 1 — pick two primes','two distinct prime numbers p and q. their product n must be > 126 so every printable character fits.','p = '+p+',  q = '+q+'  →  n = '+n+' (> 126 ✔)')
   +stepCard('✖️','step 2 — compute n','n = p × q is the public modulus. it appears in both keys and is safe to share.','n = '+p+' × '+q+' = '+n)
   +stepCard('📐','step 3 — eulers totient φ(n)','φ(n) counts integers up to n sharing no factor with n. for two primes: (p−1)(q−1). kept secret!','φ(n) = ('+p+'−1)('+q+'−1) = '+phi)
   +stepCard('🔑','step 4 — choose e','e must be coprime with φ(n): gcd(e,φ(n))=1. together (e,n) is your public key!','e = '+e+',  gcd('+e+','+phi+') = '+gcd(e,phi))
   +stepCard('🔐','step 5 — find d','d is the modular inverse of e mod φ(n). this is your private key — never share it!','d = '+d+'   →   ('+d+'×'+e+') mod '+phi+' = '+((d*e)%phi));

  updateHUDs();
}

function updateHUDs(){
  if(!S.ready)return;
  var h='<div class="hud-pub">🌿 pub (e='+S.e+', n='+S.n+')</div>'
       +'<div class="hud-priv">🔐 priv (d='+S.d+', n='+S.n+')</div>';
  document.getElementById('encKeyHud').innerHTML=h;
  document.getElementById('decKeyHud').innerHTML=h;
}

// ── Encrypt ──
function doEncrypt(){
  var er=document.getElementById('encResult'), es=document.getElementById('encSteps');
  if(!S.ready){ er.innerHTML='<div class="warn-box">generate keys first on the KEYS tab!</div>'; return; }
  var msg=document.getElementById('msgInput').value;
  if(!msg.trim()){ er.innerHTML='<div class="warn-box">type a message first!</div>'; return; }
  for(var i=0;i<msg.length;i++){
    if(msg.charCodeAt(i)>=S.n){ er.innerHTML='<div class="warn-box">char "'+msg[i]+'" (ascii '+msg.charCodeAt(i)+') >= n='+S.n+'. use larger primes!</div>'; return; }
  }

  var nums=[],rows='';
  for(var i=0;i<msg.length;i++){
    var ch=msg[i], ascii=msg.charCodeAt(i), enc=modpow(ascii,S.e,S.n);
    nums.push(enc);
    rows+='<tr><td class="td-char">'+(ch===' '?'[sp]':ch)+'</td><td class="td-ascii">'+ascii+'</td><td class="td-enc">'+enc+'</td></tr>';
  }

  var cs=nums.join(', ');
  document.getElementById('ctInput').value=cs;

  er.innerHTML='<div class="result-wrap"><div class="result-header">🔒 encrypted ciphertext</div>'
    +'<div class="result-body">numbers:<span class="result-big">'+cs+'</span></div></div>'
    +'<div class="char-table-wrap"><table class="char-table"><thead><tr><th>char</th><th>ascii</th><th>encrypted</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'<div class="success-box">auto-filled in unlock tab — go decrypt it!</div>';

  es.innerHTML=
    stepCard('🔤','step 1 — text → ascii','every character becomes its ascii number. "h"=104, "e"=101, "l"=108, "l"=108, "o"=111.','\"'+msg+'\"  →  ['+Array.from(msg).map(function(c){return c.charCodeAt(0);}).join(', ')+']')
   +stepCard('🔢','step 2 — encrypt each number','each ascii number m → c = m^e mod n using public key (e='+S.e+', n='+S.n+').','c = m^'+S.e+' mod '+S.n+'  →  ['+nums.join(', ')+']')
   +stepCard('🛡️','step 3 — why is it safe?','reversing c = m^e mod n requires factoring n = p×q — computationally infeasible for large primes!','attacker needs to factor '+S.n+' (hard without p='+S.p+', q='+S.q+')');

  document.getElementById('goDecBtn').style.display='block';
  document.getElementById('tab1').classList.add('done');
  litStar(1);
}

// ── Decrypt ──
function doDecrypt(){
  var dr=document.getElementById('decResult'), ds=document.getElementById('decSteps');
  if(!S.ready){ dr.innerHTML='<div class="warn-box">generate keys first on the KEYS tab!</div>'; return; }
  var raw=document.getElementById('ctInput').value.trim();
  if(!raw){ dr.innerHTML='<div class="warn-box">enter ciphertext numbers or encrypt something in the LOCK tab first!</div>'; return; }

  var parts=raw.split(',').map(function(x){return x.trim();});
  var nums=[],invalid=false;
  parts.forEach(function(p){ var n=parseInt(p); if(isNaN(n))invalid=true; else nums.push(n); });
  if(invalid){ dr.innerHTML='<div class="warn-box">invalid input — comma-separated numbers only!</div>'; return; }

  var chars=[],asciiArr=[],rows='';
  nums.forEach(function(c){
    var ascii=modpow(c,S.d,S.n), ch=String.fromCharCode(ascii);
    chars.push(ch); asciiArr.push(ascii);
    rows+='<tr><td class="td-enc">'+c+'</td><td class="td-ascii">'+ascii+'</td><td class="td-char">'+(ch===' '?'[sp]':ch)+'</td></tr>';
  });

  var recovered=chars.join('');

  dr.innerHTML='<div class="result-wrap dec-result-wrap"><div class="result-header">🔓 decrypted message</div>'
    +'<div class="result-body">message:<span class="result-big">'+recovered+'</span></div></div>'
    +'<div class="char-table-wrap"><table class="char-table"><thead><tr><th>cipher</th><th>ascii</th><th>char</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'<div class="success-box">quest cleared! message recovered: "'+recovered+'" ★</div>';

  ds.innerHTML=
    stepCard('🔢','step 1 — decrypt each number','each ciphertext c → m = c^d mod n using private key (d='+S.d+', n='+S.n+').','m = c^'+S.d+' mod '+S.n+'  →  ['+asciiArr.join(', ')+']')
   +stepCard('🔤','step 2 — ascii → text','each number converts back to its character via the ascii table.','['+asciiArr.join(', ')+']  →  "'+recovered+'"')
   +stepCard('🧮','step 3 — why it works',"by euler's theorem: (m^e)^d = m^(e×d) ≡ m (mod n) since d×e ≡ 1 (mod φ(n)). math magic!","(m^e)^d mod n = m");

  document.getElementById('tab2').classList.add('done');
  litStar(2);
}

onPrimeChange();
