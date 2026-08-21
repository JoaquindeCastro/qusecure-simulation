(function(){
  'use strict';

  if(typeof SCENES==='undefined' || typeof input==='undefined') return;

  var INDUSTRY_META={
    health:{noun:'healthcare network',owner:'hospital',cta:'Get crypto agility for your healthcare network'},
    finance:{noun:'bank network',owner:'bank',cta:'Get crypto agility for your bank'},
    gov:{noun:'government network',owner:'agency',cta:'Get crypto agility for your agency'},
    infra:{noun:'critical infrastructure network',owner:'operator',cta:'Get crypto agility for your infrastructure network'},
    infrastructure:{noun:'critical infrastructure network',owner:'operator',cta:'Get crypto agility for your infrastructure network'}
  };

  var SHORT_LEVELS={
    edge:'Public-facing systems only.',
    pilot:'A few internal systems.',
    orchestrated:'Most systems, managed centrally.',
    native:'Broad migration; legacy still remains.'
  };
  var SHORT_NOTES={
    edge:'The edge is protected. Most of the network is not.',
    pilot:'A pilot proves the technology works. It does not solve a network-wide change.',
    orchestrated:'Central control reaches most systems. Supplier and old hardware still sit outside it.',
    native:'Most systems are migrated. Supplier-controlled and legacy equipment still remain.'
  };

  function scene(){return SCENES[input.industry]}
  function meta(){
    var sc=scene(),m=INDUSTRY_META[input.industry];
    return m||{noun:(sc?sc.name.toLowerCase():'organization')+' network',owner:'organization',cta:'Get crypto agility for your organization'};
  }
  function assetById(id){
    var sc=scene();
    if(!sc)return null;
    for(var i=0;i<sc.assets.length;i++)if(sc.assets[i].id===id)return sc.assets[i];
    return null;
  }

  /* Keep the industry thread visible without adding another card of prose. */
  function ensureIndustryBadges(){
    [['s2','Your '],['s3','Same '],['s4','Same '],['s5','Same ']].forEach(function(x){
      var root=document.getElementById(x[0]),center=root&&root.querySelector('.center');
      if(!center)return;
      var badge=center.querySelector('.industry-badge');
      if(!badge){badge=document.createElement('p');badge.className='industry-badge';center.appendChild(badge)}
      badge.textContent=x[1]+meta().noun;
    });
  }

  /* Remove the earlier verbose enhancement layer. The picture should carry the story. */
  function stripCrowdedAdditions(){
    document.querySelectorAll('.industry-context,.crypto-bridge,.layer-drill,.layer-focus-label,.industry-level-detail').forEach(function(n){n.remove()});
  }

  function simplifyCopy(){
    var sc=scene();
    if(!sc)return;
    var s2h=document.querySelector('#s2 h2.title');
    if(s2h)s2h.textContent=sc.name+' network';
    var s2lede=document.querySelector('#s2 .center .lede');
    if(s2lede)s2lede.textContent='Click a system to isolate it. Then choose how much of its cryptography has already been upgraded.';

    var s3lede=document.querySelector('#s3 .center .lede');
    if(s3lede)s3lede.textContent='Pick what changes. The same network stays in view.';

    document.querySelectorAll('#levels .level').forEach(function(card){
      var span=card.querySelector(':scope > span');
      if(span&&SHORT_LEVELS[card.dataset.key])span.textContent=SHORT_LEVELS[card.dataset.key];
    });

    var d2=document.getElementById('d2crypto');
    if(d2&&(!window.pinned2))d2.textContent='Select a point to see what cryptography it uses and whether this readiness level reaches it.';

    var triggerCopy=document.getElementById('triggerCopy');
    if(triggerCopy&&typeof EVENTS!=='undefined'&&EVENTS[input.event]){
      triggerCopy.textContent=EVENTS[input.event].blurb+' Watch which systems change state.';
    }
  }

  /* Each hotspot is treated as its own visual component. The underlying illustration is greyed,
     while a clipped full-colour copy of the selected component is placed over it. This avoids
     redrawing the artwork and keeps every highlight aligned with the simulation's own coordinates. */
  function componentRadius(a){
    if(!a)return [15,12];
    if(a.id==='core')return [25,20];
    if(a.band==='keys')return [17,13];
    if(a.band==='legacy')return [16,12];
    if(a.band==='edge')return [17,13];
    return [15,12];
  }

  function ensureSceneOverlay(host){
    if(!host||!host.querySelector('.plate-img'))return;
    var base=host.querySelector('.plate-img');
    var overlay=host.querySelector('.component-overlay');
    if(!overlay){
      overlay=document.createElement('img');
      overlay.className='plate-img component-overlay';
      overlay.alt='';overlay.setAttribute('aria-hidden','true');
      overlay.width=base.width||1122;overlay.height=base.height||1402;
      host.insertBefore(overlay,host.querySelector('.links'));
    }
    if(overlay.src!==base.src)overlay.src=base.src;

    var label=host.parentElement&&host.parentElement.querySelector('.component-nameplate');
    if(!label&&host.parentElement){
      label=document.createElement('p');label.className='component-nameplate';
      label.textContent='Select a system to isolate it';
      host.insertAdjacentElement('beforebegin',label);
    }

    if(host.dataset.componentWired)return;
    host.dataset.componentWired='1';
    host.addEventListener('click',function(e){
      var spot=e.target.closest('.spot');
      if(!spot)return;
      var id=spot.dataset.id;
      focusComponent(host,host.dataset.focusId===id?null:id);
    });
  }

  function focusComponent(host,id){
    if(!host)return;
    var overlay=host.querySelector('.component-overlay'),label=host.parentElement&&host.parentElement.querySelector('.component-nameplate');
    if(!overlay)return;
    host.dataset.focusId=id||'';
    host.classList.toggle('component-focus',!!id);
    host.querySelectorAll('.spot').forEach(function(s){
      s.classList.toggle('component-on',!!id&&s.dataset.id===id);
    });
    if(!id){
      overlay.style.clipPath='none';overlay.style.webkitClipPath='none';
      if(label)label.textContent='Select a system to isolate it';
      return;
    }
    var a=assetById(id);if(!a)return;
    var r=componentRadius(a),clip='ellipse('+r[0]+'% '+r[1]+'% at '+a.x+'% '+a.y+'%)';
    overlay.style.clipPath=clip;overlay.style.webkitClipPath=clip;
    if(label)label.textContent=a.name;
  }

  function wireComponentScenes(){
    ['scene2','scene4','scene5','scene6'].forEach(function(id){
      var host=document.getElementById(id);if(host)ensureSceneOverlay(host);
    });
  }

  function simplifyReadinessAfterPaint(){
    if(document.getElementById('stackNote'))document.getElementById('stackNote').textContent=SHORT_NOTES[input.adoption]||'';
    document.querySelectorAll('#levels .level').forEach(function(card){
      var span=card.querySelector(':scope > span');
      if(span&&SHORT_LEVELS[card.dataset.key])span.textContent=SHORT_LEVELS[card.dataset.key];
    });
    var host=document.getElementById('scene2');
    if(host){ensureSceneOverlay(host);if(host.dataset.focusId)focusComponent(host,host.dataset.focusId)}
  }

  function ensureResultDisclosure(){
    var root=document.getElementById('s5');if(!root)return;
    var details=root.querySelector('.result-disclosure');
    if(!details){
      details=document.createElement('details');details.className='result-disclosure';
      details.innerHTML='<summary>Why this happened</summary>';
      var headline=document.getElementById('headline');
      if(headline)headline.insertAdjacentElement('afterend',details);
    }
    var qa=root.querySelector('.qa'),props=document.getElementById('props');
    if(qa&&qa.parentElement!==details)details.appendChild(qa);
    if(props&&props.parentElement!==details)details.appendChild(props);
  }

  function ensureAha(){
    var reveal=document.getElementById('reveal');if(!reveal)return;
    var aha=document.querySelector('#s5 .aha-bridge');
    if(!aha){aha=document.createElement('section');aha.className='aha-bridge';reveal.parentElement.insertBefore(aha,reveal)}
    var r=(typeof result!=='undefined'&&result)?result:null;
    var proof=r&&r.counts?'<div class="aha-proof"><span>'+r.counts.affected+' affected</span><span>'+r.counts.exposed+' directly reachable</span></div>':'';
    aha.innerHTML='<p class="eyebrow">The aha</p><h3>The edge was the easy part.</h3><p>The hard part is changing cryptography across the whole '+meta().noun+'. Crypto agility turns that from a system-by-system scramble into one coordinated change.</p>'+proof;
    var title=document.getElementById('revealTitle');if(title)title.textContent='Now give the same network crypto agility';
    var intro=document.getElementById('revealIntro');if(intro)intro.textContent='Same event. Same systems. Change one capability: find and replace cryptography centrally.';
    var button=document.getElementById('showAgile');if(button)button.textContent='Replay with crypto agility →';
  }

  function updateCTA(){
    var cta=document.getElementById('cta');if(!cta)return;
    var h=cta.querySelector('h3');if(h)h.textContent='What next?';
    var p=cta.querySelector(':scope > p');if(p)p.textContent='Crypto agility makes the cryptography you control visible, centralized and replaceable.';
    var primary=document.getElementById('ctaPrimary');if(primary)primary.textContent=meta().cta;
    var explore=cta.querySelector('[data-go="6"]');if(explore){explore.textContent='Keep playing';explore.classList.add('keep-playing')}
    var learn=cta.querySelector('.cta-learn');if(learn)learn.remove();
  }

  function ensureQuickTakeaway(){
    var trigger=document.querySelector('.quick-takeaway-trigger'),dlg=document.getElementById('quickTakeaway');
    if(!trigger){
      trigger=document.createElement('button');trigger.type='button';trigger.className='quick-takeaway-trigger';trigger.textContent='30-second takeaway';document.body.appendChild(trigger);
    }
    if(!dlg){
      dlg=document.createElement('dialog');dlg.id='quickTakeaway';dlg.className='quick-takeaway';
      dlg.innerHTML='<div class="takeaway-inner"><button class="takeaway-close" type="button" aria-label="Close">×</button><p class="eyebrow">If you stop here</p><h3>One thing to remember</h3><p class="one-line"><b>Protecting the edge is not crypto agility.</b> Crypto agility is being able to change cryptography across the network when the rules change.</p><div class="takeaway-actions"><a class="btn primary" href="https://www.qusecure.com" target="_blank" rel="noopener noreferrer">Learn about QuSecure</a><button class="btn takeaway-return" type="button">Keep exploring</button></div></div>';
      document.body.appendChild(dlg);
      dlg.querySelector('.takeaway-close').onclick=function(){dlg.close()};
      dlg.querySelector('.takeaway-return').onclick=function(){dlg.close()};
      dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
    }
    trigger.onclick=function(){if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','')};
  }

  function updateQuickVisibility(n){document.body.classList.toggle('show-quick-takeaway',n>=2&&n<=4)}

  function refresh(n){
    stripCrowdedAdditions();
    simplifyCopy();
    ensureIndustryBadges();
    wireComponentScenes();
    ensureResultDisclosure();
    ensureAha();
    updateCTA();
    ensureQuickTakeaway();
    if(typeof n==='number')updateQuickVisibility(n);
  }

  if(typeof paintReadiness==='function'){
    var basePaintReadiness=paintReadiness;
    window.paintReadiness=function(){var out=basePaintReadiness.apply(this,arguments);simplifyReadinessAfterPaint();return out};
  }
  if(typeof renderScene==='function'){
    var baseRenderScene=renderScene;
    window.renderScene=function(){var out=baseRenderScene.apply(this,arguments);var host=arguments[0];if(host)ensureSceneOverlay(host);return out};
  }
  if(typeof paintResult==='function'){
    var basePaintResult=paintResult;
    window.paintResult=function(){var out=basePaintResult.apply(this,arguments);ensureResultDisclosure();ensureAha();updateCTA();wireComponentScenes();return out};
  }
  if(typeof go==='function'){
    var baseGo=go;
    window.go=function(n){var out=baseGo.apply(this,arguments);setTimeout(function(){refresh(n)},0);return out};
  }

  var pick=document.getElementById('pickIndustry');
  if(pick)pick.addEventListener('click',function(){setTimeout(function(){refresh(2)},0)});

  refresh(0);
})();
