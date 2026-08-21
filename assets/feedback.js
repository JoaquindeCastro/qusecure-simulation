(function(){
  'use strict';

  if(typeof SCENES==='undefined' || typeof input==='undefined') return;

  var INDUSTRY_META={
    health:{noun:'healthcare network',owner:'hospital',cta:'Get crypto agility for your healthcare network'},
    finance:{noun:'bank network',owner:'bank',cta:'Get crypto agility for your bank'},
    gov:{noun:'government network',owner:'agency',cta:'Get crypto agility for your agency'},
    infra:{noun:'critical infrastructure network',owner:'infrastructure operator',cta:'Get crypto agility for your infrastructure network'},
    infrastructure:{noun:'critical infrastructure network',owner:'infrastructure operator',cta:'Get crypto agility for your infrastructure network'}
  };

  var currentBand='all';

  function scene(){ return SCENES[input.industry]; }
  function meta(){
    var sc=scene(), key=input.industry;
    return INDUSTRY_META[key] || {
      noun:(sc ? sc.name.toLowerCase() : 'organization')+' network',
      owner:(sc ? sc.name.toLowerCase() : 'organization'),
      cta:'Get crypto agility for your organization'
    };
  }
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function firstNames(list,n){return list.slice(0,n).map(function(a){return a.name}).join(' + ')}

  function contextMarkup(kind,compact){
    var sc=scene(), m=meta();
    if(!sc) return '';
    var copy={
      readiness:['Industry locked in','You chose '+sc.name+'. Here’s your '+m.noun+'.','Every point on this image is one of the systems whose cryptography you are about to stress-test.'],
      event:['Same environment','Still inside your '+m.noun+'.','Now change the cryptographic rules and watch the same systems respond.'],
      trigger:['Same systems, new pressure','Watch the shock move through your '+m.noun+'.','Nothing has reset between screens — the systems you selected are the systems that get hit.'],
      result:['Same network, same event','Now compare two ways of responding.','The industry, suppliers, people and event stay fixed. Only the ability to find and change cryptography centrally changes.']
    }[kind];
    return '<div class="industry-context '+(compact?'compact':'')+'" data-context="'+kind+'">'+
      '<img src="'+esc(sc.img)+'" alt="" aria-hidden="true">'+
      '<div><span class="kicker">'+esc(copy[0])+'</span><strong>'+esc(copy[1])+'</strong><p>'+esc(copy[2])+'</p></div></div>';
  }

  function ensureIndustryContext(){
    var s2=document.querySelector('#s2 .center');
    if(s2){
      var old2=document.querySelector('#s2 [data-context="readiness"]');
      if(old2) old2.remove();
      s2.insertAdjacentHTML('afterend',contextMarkup('readiness',false));
      var h2=document.querySelector('#s2 h2.title');
      if(h2) h2.textContent='You chose '+scene().name+'. Here’s your '+meta().noun+'.';
    }
    [['s3','event'],['s4','trigger'],['s5','result']].forEach(function(pair){
      var root=document.getElementById(pair[0]);
      if(!root) return;
      var old=root.querySelector('[data-context="'+pair[1]+'"]');
      if(old) old.remove();
      var center=root.querySelector('.center');
      if(center) center.insertAdjacentHTML('afterend',contextMarkup(pair[1],true));
    });
  }

  function ensureCryptoBridge(){
    var root=document.getElementById('s2');
    if(!root || root.querySelector('.crypto-bridge')) return;
    var ctx=root.querySelector('[data-context="readiness"]');
    if(!ctx) return;
    ctx.insertAdjacentHTML('afterend',
      '<section class="crypto-bridge" aria-label="How cryptography becomes protection">'+
      '<p><b>What “protected” means here:</b> not a shield around the building. It means the cryptographic dependency on each system has actually been found and changed.</p>'+ 
      '<div class="bridge-flow">'+
        '<div class="bridge-step"><b>1 · A system relies on cryptography</b><span>Keys, certificates and signatures keep it private and prove identity.</span></div>'+ 
        '<div class="bridge-arrow" aria-hidden="true">→</div>'+ 
        '<div class="bridge-step"><b>2 · You have to know where it lives</b><span>If nobody has a record of that dependency, no migration tool can reach it.</span></div>'+ 
        '<div class="bridge-arrow" aria-hidden="true">→</div>'+ 
        '<div class="bridge-step"><b>3 · “Protected” means it was replaced</b><span>The map lights up only when that system’s cryptography has actually moved.</span></div>'+ 
      '</div></section>');
  }

  function ensureLayerDrill(){
    var host=document.getElementById('scene2');
    if(!host) return;
    var parent=host.parentElement;
    var drill=document.getElementById('layerDrill');
    if(!drill){
      drill=document.createElement('div');
      drill.id='layerDrill';
      drill.className='layer-drill';
      drill.innerHTML='<span>Focus the network:</span>'+
        '<button class="layer-chip" type="button" data-band="all" aria-pressed="true">All systems</button>'+
        BANDS.map(function(b){return '<button class="layer-chip" type="button" data-band="'+esc(b.id)+'" aria-pressed="false">'+esc(b.label)+'</button>'}).join('');
      parent.insertBefore(drill,host);
      var label=document.createElement('p');
      label.id='layerFocusLabel';label.className='layer-focus-label';
      drill.insertAdjacentElement('afterend',label);
      drill.addEventListener('click',function(e){
        var b=e.target.closest('[data-band]');
        if(!b) return;
        currentBand=b.dataset.band;
        applyBandFocus();
      });
    }
    applyBandFocus();
  }

  function annotateSceneBands(){
    var host=document.getElementById('scene2'), sc=scene();
    if(!host||!sc) return;
    var byId={};sc.assets.forEach(function(a){byId[a.id]=a});
    host.querySelectorAll('.spot').forEach(function(s){
      var a=byId[s.dataset.id];
      if(a) s.dataset.band=a.band;
    });
    host.querySelectorAll('.links path').forEach(function(p){
      var from=byId[p.dataset.from],to=byId[p.dataset.to];
      if(from) p.dataset.fromBand=from.band;
      if(to) p.dataset.toBand=to.band;
    });
  }

  function applyBandFocus(){
    var host=document.getElementById('scene2'), sc=scene();
    if(!host||!sc) return;
    annotateSceneBands();
    var all=currentBand==='all';
    host.classList.toggle('layer-focus',!all);
    host.querySelectorAll('.spot').forEach(function(s){s.classList.toggle('band-on',!all&&s.dataset.band===currentBand)});
    host.querySelectorAll('.links path').forEach(function(p){p.classList.toggle('band-on',!all&&(p.dataset.fromBand===currentBand||p.dataset.toBand===currentBand))});
    document.querySelectorAll('#layerDrill [data-band]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.band===currentBand)});
    var label=document.getElementById('layerFocusLabel');
    if(label){
      if(all){label.textContent='All '+sc.assets.length+' systems in your '+meta().noun+' are visible.'}
      else{
        var band=BANDS.filter(function(b){return b.id===currentBand})[0];
        var names=sc.assets.filter(function(a){return a.band===currentBand});
        label.textContent=(band?band.label:currentBand)+': '+firstNames(names,4)+(names.length>4?' + '+(names.length-4)+' more':'');
      }
    }
  }

  function updateLevelExamples(){
    if(typeof coveredSet!=='function') return;
    var sc=scene();
    if(!sc) return;
    document.querySelectorAll('#levels .level').forEach(function(card){
      var key=card.dataset.key, cfg=ADOPTION[key];
      if(!cfg) return;
      var covered=coveredSet(sc.assets,cfg.coverage),yes=[],no=[];
      sc.assets.forEach(function(a){(covered[a.id]?yes:no).push(a)});
      var detail=card.querySelector('.industry-level-detail');
      if(!detail){detail=document.createElement('span');detail.className='industry-level-detail';card.appendChild(detail)}
      var yesText=yes.length?firstNames(yes,2):'no systems';
      var noText=no.length?firstNames(no,2):'nothing else';
      detail.innerHTML='<strong>In this '+esc(meta().noun)+':</strong> '+esc(yesText)+' protected; '+esc(noText)+(no.length>2?' + '+(no.length-2)+' more':'')+' still unchanged.';
    });
  }

  function ensureAha(){
    var reveal=document.getElementById('reveal');
    if(!reveal) return;
    var aha=document.querySelector('#s5 .aha-bridge');
    if(!aha){
      aha=document.createElement('section');aha.className='aha-bridge';
      reveal.parentElement.insertBefore(aha,reveal);
    }
    var r=(typeof result!=='undefined'&&result)?result:null;
    var proof='';
    if(r&&r.counts){
      proof='<div class="aha-proof"><span>'+r.counts.affected+' systems under pressure</span><span>'+r.counts.exposed+' directly actionable</span><span>'+ (r.counts.blocked+r.counts.unknown)+' outside direct control</span></div>';
    }
    aha.innerHTML='<p class="eyebrow">The turn</p><h3>You’re exposed. This is the part you can change.</h3>'+ 
      '<p>Crypto agility is not another shield at the edge. It is the ability to find the cryptography already spread across this '+esc(meta().noun)+' and replace it centrally when the rules change. Suppliers and old hardware still set their own clocks — but the systems you control stop being a machine-by-machine scramble.</p>'+proof;
    var title=document.getElementById('revealTitle');
    if(title) title.textContent='Give the same organization crypto agility';
    var intro=document.getElementById('revealIntro');
    if(intro) intro.textContent='Keep the same event, suppliers, people and systems. Change one capability only: the organization can find its cryptography and replace it from one place. Now replay the exact same stress event.';
    var button=document.getElementById('showAgile');
    if(button) button.textContent='Replay with crypto agility →';
  }

  function updateCTA(){
    var cta=document.getElementById('cta');
    if(!cta) return;
    var h=cta.querySelector('h3');
    if(h) h.textContent='You found the gap. Decide what to do next.';
    var p=cta.querySelector(':scope > p');
    if(p) p.textContent='Protecting the public edge was the easy part. The hard part was reaching the cryptography spread through the systems behind it. Crypto agility makes that response visible, centralized and repeatable — without pretending suppliers or old hardware disappear.';
    var primary=document.getElementById('ctaPrimary');
    if(primary) primary.textContent=meta().cta;
    var explore=cta.querySelector('[data-go="6"]');
    if(explore){explore.textContent='Keep playing';explore.classList.add('keep-playing')}
    if(!cta.querySelector('.cta-learn')){
      var details=document.createElement('details');details.className='cta-learn';
      details.innerHTML='<summary>Learn about crypto agility</summary><p>Crypto agility means knowing where cryptography is deployed, setting policy centrally, and being able to replace keys, certificates and algorithms without rebuilding every application. The simulator keeps the systems it cannot fix visible on purpose: agility speeds up what you control; it does not erase supplier or hardware constraints.</p>';
      var foot=cta.querySelector('.cta-foot');
      cta.insertBefore(details,foot||null);
    }
  }

  function ensureQuickTakeaway(){
    var trigger=document.querySelector('.quick-takeaway-trigger');
    var dlg=document.getElementById('quickTakeaway');
    if(!trigger){
      trigger=document.createElement('button');trigger.type='button';trigger.className='quick-takeaway-trigger';trigger.textContent='30-second takeaway';
      document.body.appendChild(trigger);
    }
    if(!dlg){
      dlg=document.createElement('dialog');dlg.id='quickTakeaway';dlg.className='quick-takeaway';
      dlg.innerHTML='<div class="takeaway-inner"><button class="takeaway-close" type="button" aria-label="Close">×</button><p class="eyebrow">If you stop here</p><h3>One sentence to remember</h3><p class="one-line"></p><p class="takeaway-industry"></p><div class="takeaway-actions"><a class="btn primary" href="https://www.qusecure.com" target="_blank" rel="noopener noreferrer">Learn about QuSecure</a><button class="btn takeaway-return" type="button">Keep exploring</button></div></div>';
      document.body.appendChild(dlg);
      dlg.querySelector('.takeaway-close').onclick=function(){dlg.close()};
      dlg.querySelector('.takeaway-return').onclick=function(){dlg.close()};
      dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
    }
    trigger.onclick=function(){updateTakeawayCopy(); if(typeof dlg.showModal==='function')dlg.showModal(); else dlg.setAttribute('open','')};
    updateTakeawayCopy();
  }

  function updateTakeawayCopy(){
    var dlg=document.getElementById('quickTakeaway'),sc=scene();
    if(!dlg||!sc) return;
    var examples=firstNames(sc.assets,3);
    dlg.querySelector('.one-line').innerHTML='<b>Protecting one edge system is not crypto agility.</b> Crypto agility is being able to find and change cryptography across the whole network when the rules change.';
    dlg.querySelector('.takeaway-industry').textContent='In this '+meta().noun+', that means systems such as '+examples+' — not just the public-facing edge.';
  }

  function updateQuickVisibility(n){
    document.body.classList.toggle('show-quick-takeaway',n>=2&&n<=4);
  }

  function refresh(n){
    ensureIndustryContext();
    ensureCryptoBridge();
    ensureLayerDrill();
    updateLevelExamples();
    applyBandFocus();
    ensureAha();
    updateCTA();
    ensureQuickTakeaway();
    if(typeof n==='number') updateQuickVisibility(n);
    updateTakeawayCopy();
  }

  if(typeof paintReadiness==='function'){
    var basePaintReadiness=paintReadiness;
    window.paintReadiness=function(){
      var out=basePaintReadiness.apply(this,arguments);
      updateLevelExamples();
      applyBandFocus();
      return out;
    };
  }
  if(typeof paintResult==='function'){
    var basePaintResult=paintResult;
    window.paintResult=function(){
      var out=basePaintResult.apply(this,arguments);
      ensureIndustryContext();ensureAha();updateCTA();
      return out;
    };
  }
  if(typeof go==='function'){
    var baseGo=go;
    window.go=function(n){
      var out=baseGo.apply(this,arguments);
      setTimeout(function(){refresh(n)},0);
      return out;
    };
  }

  var pick=document.getElementById('pickIndustry');
  if(pick) pick.addEventListener('click',function(){setTimeout(function(){currentBand='all';refresh(2)},0)});

  refresh(0);
})();
