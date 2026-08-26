(function () {
  'use strict';

  if (
    typeof SCENES === 'undefined' ||
    typeof ADOPTION === 'undefined' ||
    typeof EVENTS === 'undefined' ||
    typeof simulate !== 'function' ||
    typeof migrationSet !== 'function' ||
    typeof input === 'undefined'
  ) return;

  var ORDER = ['health', 'finance', 'gov', 'infra'];
  var READINESS_ORDER = ['none', 'edge', 'pilot', 'orchestrated', 'native'];
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var SCENARIO_META = {
    qday: {
      title: 'Q-Day',
      short: "Today's common internet security can no longer be trusted.",
      result: "Systems still relying on today's common internet security (e.g. RSA) become vulnerable at once."
    },
    tls: {
      title: 'PQC migration deadline',
      short: 'A hard deadline forces an urgent replacement.',
      result: 'Systems still using quantum-vulnerable cryptography must change or be switched off.'
    },
    mlkem: {
      title: 'PQC vulnerability found',
      short: 'Systems that already upgraded have to change again.',
      result: 'Systems that adopted the vulnerable PQC implementation must move again.'
    },
    ca: {
      title: 'Digital trust failure',
      short: 'Systems across the network can no longer prove who they are.',
      result: 'Systems relying on the failed identity provider can no longer prove who they are.'
    }
  };

  var READINESS_META = {
    none: {
      title: 'None',
      short: 'Not sure? Click None - We have not heard of PQC'
    },
    edge: {
      title: 'Public edge only',
      short: "We trust that our providers know what they're doing"
    },
    pilot: {
      title: 'A few internal systems',
      short: 'We’ve tried or started implementing PQC'
    },
    orchestrated: {
      title: 'Most internal systems',
      short: 'We are making it a requirement'
    },
    native: {
      title: 'Broad migration',
      short: 'We have upgraded all of our current systems'
    }
  };

  var INDUSTRY_CTA = {
    health: 'Get crypto agility for healthcare',
    finance: 'Get crypto agility for your bank',
    gov: 'Get crypto agility for government',
    infra: 'Get crypto agility for infrastructure'
  };

  var app;
  var industryView;
  var workspace;
  var side;
  var sceneHost;
  var sceneLabel;
  var overlay;
  var changeIndustry;
  var selectedAsset = null;
  var currentResult = null;
  var animationToken = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function scene() {
    return SCENES[input.industry];
  }

  function assetById(id) {
    var assets = scene().assets;
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].id === id) return assets[i];
    }
    return null;
  }

  function buildApp() {
    var old = document.getElementById('qv2');
    if (old) old.remove();

    document.body.classList.add('qv2-active');
    var original = document.querySelector('.shell');
    if (original) original.setAttribute('aria-hidden', 'true');

    app = el('div', 'qv2');
    app.id = 'qv2';

    var top = el('header', 'qv2-top');
    var brand = el('button', 'qv2-brand');
    brand.type = 'button';
    brand.innerHTML = '<span>QuSecure</span><small>Q-Day Simulation</small>';
    brand.addEventListener('click', showIndustryGrid);

    var topActions = el('div', 'qv2-top-actions');
    changeIndustry = el('button', 'qv2-link', 'Change industry');
    changeIndustry.type = 'button';
    changeIndustry.hidden = true;
    changeIndustry.addEventListener('click', showIndustryGrid);
    topActions.appendChild(changeIndustry);
    top.appendChild(brand);
    top.appendChild(topActions);

    var main = el('main', 'qv2-main');
    industryView = el('section', 'qv2-industry');
    industryView.id = 'qv2Industry';
    main.appendChild(industryView);

    workspace = el('section', 'qv2-workspace');
    workspace.id = 'qv2Workspace';
    workspace.hidden = true;

    var stage = el('div', 'qv2-stage');
    var visual = el('div', 'qv2-visual');
    sceneHost = el('div', 'qv2-scene');
    sceneHost.id = 'qv2Scene';
    sceneLabel = el('p', 'qv2-scene-label', 'Click a system to isolate it');
    visual.appendChild(sceneHost);
    visual.appendChild(sceneLabel);

    side = el('aside', 'qv2-side');
    side.id = 'qv2Side';
    side.setAttribute('aria-live', 'polite');

    stage.appendChild(visual);
    stage.appendChild(side);
    workspace.appendChild(stage);

    overlay = buildScenarioOverlay();
    workspace.appendChild(overlay);
    main.appendChild(workspace);

    app.appendChild(top);
    app.appendChild(main);
    document.body.appendChild(app);

    renderIndustryGrid();
  }

  function renderIndustryGrid() {
    animationToken++;
    industryView.textContent = '';

    var heading = el('div', 'qv2-industry-heading');
    heading.appendChild(el('p', 'qv2-kicker', 'Interactive simulation'));
    heading.appendChild(el('h1', '', 'Choose an industry'));
    heading.appendChild(el('p', 'qv2-intro', 'Learn the common components that make up your industry, and how these dependencies can become liabilities.'));

    var grid = el('div', 'qv2-industry-grid');
    ORDER.forEach(function (key) {
      var sc = SCENES[key];
      var button = el('button', 'qv2-industry-card');
      button.type = 'button';
      button.dataset.industry = key;
      button.setAttribute('aria-label', 'Choose ' + sc.name);

      var imageWrap = el('span', 'qv2-industry-image');
      var image = document.createElement('img');
      image.src = sc.img;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.width = 1122;
      image.height = 1402;
      imageWrap.appendChild(image);

      var copy = el('span', 'qv2-industry-copy');
      copy.appendChild(el('b', '', sc.name));
      copy.appendChild(el('span', '', shortIndustryLine(key)));

      button.appendChild(imageWrap);
      button.appendChild(copy);
      button.addEventListener('click', function () { chooseIndustry(key); });
      grid.appendChild(button);
    });

    industryView.appendChild(heading);
    industryView.appendChild(grid);
  }

  function shortIndustryLine(key) {
    return {
      health: 'Hospitals, devices and patient systems',
      finance: 'Payments, identity and core banking',
      gov: 'Citizen services and national systems',
      infra: 'Power, water and industrial control'
    }[key];
  }

  function chooseIndustry(key) {
    animationToken++;
    input.industry = key;
    input.adoption = 'none';
    input.orch = 15;
    input.recon = false;
    selectedAsset = null;
    currentResult = null;

    industryView.hidden = true;
    workspace.hidden = false;
    changeIndustry.hidden = false;

    renderPersistentScene();
    renderReadiness();
  }

  function showIndustryGrid() {
    animationToken++;
    closeScenarioOverlay();
    workspace.hidden = true;
    industryView.hidden = false;
    changeIndustry.hidden = true;
    selectedAsset = null;
    currentResult = null;
    var title = industryView.querySelector('h1');
    if (title) title.focus({ preventScroll: true });
  }

  function renderPersistentScene() {
    var sc = scene();
    sceneHost.textContent = '';
    sceneHost.dataset.industry = input.industry;

    var base = document.createElement('img');
    base.className = 'qv2-scene-image qv2-base-image';
    base.src = sc.img;
    base.alt = sc.alt;
    base.width = 1122;
    base.height = 1402;
    base.decoding = 'async';

    var highlight = document.createElement('img');
    highlight.className = 'qv2-scene-image qv2-highlight-image';
    highlight.src = sc.img;
    highlight.alt = '';
    highlight.setAttribute('aria-hidden', 'true');
    highlight.width = 1122;
    highlight.height = 1402;

    sceneHost.appendChild(base);
    sceneHost.appendChild(highlight);

    var byId = {};
    sc.assets.forEach(function (asset) { byId[asset.id] = asset; });

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'qv2-links');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    sc.links.forEach(function (link) {
      var from = byId[link[0]];
      var to = byId[link[1]];
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + from.x + ' ' + from.y + 'L' + to.x + ' ' + to.y);
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      path.dataset.from = link[0];
      path.dataset.to = link[1];
      svg.appendChild(path);
    });
    sceneHost.appendChild(svg);

    sc.assets.forEach(function (asset) {
      var spot = el('button', 'qv2-spot');
      spot.type = 'button';
      spot.dataset.id = asset.id;
      spot.style.left = asset.x + '%';
      spot.style.top = asset.y + '%';
      spot.setAttribute('aria-label', asset.name);
      spot.innerHTML = '<i aria-hidden="true"></i><span>' + escapeHtml(asset.name) + '</span>';
      spot.addEventListener('click', function (event) {
        event.stopPropagation();
        focusAsset(selectedAsset === asset.id ? null : asset.id);
      });
      sceneHost.appendChild(spot);
    });

    sceneHost.onclick = function (event) {
      if (!event.target.closest('.qv2-spot')) focusAsset(null);
    };

    paintReadinessScene();
  }

  function focusAsset(id) {
    selectedAsset = id;
    var highlight = sceneHost.querySelector('.qv2-highlight-image');
    sceneHost.classList.toggle('is-isolating', !!id);

    sceneHost.querySelectorAll('.qv2-spot').forEach(function (spot) {
      var active = !!id && spot.dataset.id === id;
      spot.classList.toggle('is-selected', active);
      spot.setAttribute('aria-pressed', String(active));
    });

    if (!id) {
      highlight.style.clipPath = 'none';
      highlight.style.webkitClipPath = 'none';
      sceneLabel.textContent = 'Click a system to isolate it';
      return;
    }

    var asset = assetById(id);
    var radius = componentRadius(asset);
    var clip = 'ellipse(' + radius[0] + '% ' + radius[1] + '% at ' + asset.x + '% ' + asset.y + '%)';
    highlight.style.clipPath = clip;
    highlight.style.webkitClipPath = clip;
    sceneLabel.textContent = asset.name;
  }

  function componentRadius(asset) {
    if (asset.id === 'core') return [25, 19];
    if (asset.band === 'keys') return [19, 14];
    if (asset.band === 'legacy') return [18, 14];
    if (asset.band === 'edge') return [18, 14];
    return [16, 13];
  }

  function renderReadiness() {
    animationToken++;
    side.textContent = '';

    var header = el('div', 'qv2-side-header');
    header.appendChild(el('p', 'qv2-kicker', scene().name));
    header.appendChild(el('h2', '', 'Where do you currently have post-quantum cryptography?'));

    var levels = el('div', 'qv2-levels');
    READINESS_ORDER.forEach(function (key) {
      var data = READINESS_META[key];
      var button = el('button', 'qv2-level');
      button.type = 'button';
      button.dataset.level = key;
      button.setAttribute('aria-pressed', String(input.adoption === key));
      button.innerHTML = '<span class="qv2-radio" aria-hidden="true"></span><span><b>' +
        escapeHtml(data.title) + '</b><small>' + escapeHtml(data.short) + '</small></span>';
      button.addEventListener('click', function () {
        input.adoption = key;
        input.recon = false;
        renderReadiness();
        paintReadinessScene();
      });
      levels.appendChild(button);
    });

    var count = el('p', 'qv2-readiness-count');
    count.id = 'qv2ReadinessCount';

    var action = el('button', 'qv2-primary', 'Choose a scenario');
    action.type = 'button';
    action.addEventListener('click', openScenarioOverlay);

    side.appendChild(header);
    side.appendChild(levels);
    side.appendChild(count);
    side.appendChild(action);

    updateReadinessCount();
    paintReadinessScene();
  }

  function currentMigrationSet() {
    return migrationSet(scene().assets, input.adoption, input);
  }

  function updateReadinessCount() {
    var sc = scene();
    var covered = currentMigrationSet();
    var count = Object.keys(covered).length;
    var output = document.getElementById('qv2ReadinessCount');
    if (output) output.innerHTML = '<b>' + count + ' of ' + sc.assets.length + '</b> systems are protected at this level.';
  }

  function paintReadinessScene() {
    if (!sceneHost || !sceneHost.querySelector('.qv2-spot')) return;
    var sc = scene();
    var covered = currentMigrationSet();
    var states = {};
    sc.assets.forEach(function (asset) {
      states[asset.id] = covered[asset.id] ? 'protected' : (asset.band === 'legacy' ? 'holdout' : 'dim');
    });
    paintScene(states);
  }

  function buildScenarioOverlay() {
    var layer = el('div', 'qv2-overlay');
    layer.id = 'qv2Overlay';
    layer.hidden = true;
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'qv2ScenarioTitle');

    var panel = el('div', 'qv2-overlay-panel');
    var close = el('button', 'qv2-overlay-close', 'Close');
    close.type = 'button';
    close.addEventListener('click', closeScenarioOverlay);

    var heading = el('div', 'qv2-overlay-heading');
    heading.appendChild(el('p', 'qv2-kicker', 'Simulate Scenario'));
    var title = el('h2', '', 'What changes?');
    title.id = 'qv2ScenarioTitle';
    heading.appendChild(title);

    var grid = el('div', 'qv2-scenario-grid');
    Object.keys(SCENARIO_META).forEach(function (key) {
      var data = SCENARIO_META[key];
      var button = el('button', 'qv2-scenario');
      button.type = 'button';
      button.dataset.scenario = key;
      button.innerHTML = '<span>' + escapeHtml(data.title) + '</span><small>' + escapeHtml(data.short) + '</small><i aria-hidden="true">&rarr;</i>';
      button.addEventListener('click', function () { chooseScenario(key); });
      grid.appendChild(button);
    });

    panel.appendChild(close);
    panel.appendChild(heading);
    panel.appendChild(grid);
    layer.appendChild(panel);

    layer.addEventListener('click', function (event) {
      if (event.target === layer) closeScenarioOverlay();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !layer.hidden) closeScenarioOverlay();
    });

    return layer;
  }

  function openScenarioOverlay() {
    animationToken++;
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      var first = overlay.querySelector('.qv2-scenario');
      if (first) first.focus({ preventScroll: true });
    });
  }

  function closeScenarioOverlay() {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('is-open');
    setTimeout(function () { overlay.hidden = true; }, 160);
  }

  function chooseScenario(key) {
    input.event = key;
    input.recon = false;
    currentResult = simulate(input);
    closeScenarioOverlay();
    renderResult(currentResult);
  }

  function resultBlock(title) {
    var block = el('section', 'qv2-comparison-block qv2-segment');
    block.appendChild(el('p', 'qv2-agility-title', title));
    return block;
  }

  function resultStat(number, label) {
    var stat = el('p', 'qv2-agility-stat');
    stat.innerHTML = '<b>' + number + '</b> ' + escapeHtml(label);
    return stat;
  }

  function idsForState(states, wanted) {
    return Object.keys(states || {}).filter(function (id) {
      return wanted.indexOf(states[id]) >= 0;
    });
  }

  function stagedStates(result, included) {
    var states = {};
    Object.keys(result.states).forEach(function (id) {
      var state = result.states[id];
      if (state === 'protected') states[id] = 'protected';
      else if (included.indexOf(state) >= 0) states[id] = state;
      else states[id] = 'dim';
    });
    return states;
  }

  function resolvedStates(result) {
    var states = {};
    Object.keys(result.states).forEach(function (id) {
      states[id] = result.states[id] === 'exposed' ? 'resolved' : result.states[id];
    });
    return states;
  }

  function pulseIds(ids) {
    if (!sceneHost || REDUCED) return;
    var wanted = {};
    ids.forEach(function (id) { wanted[id] = true; });
    sceneHost.querySelectorAll('.qv2-spot').forEach(function (spot) {
      spot.classList.remove('qv2-step-pulse');
      if (wanted[spot.dataset.id]) {
        void spot.offsetWidth;
        spot.classList.add('qv2-step-pulse');
      }
    });
  }

  function clearPulses() {
    if (!sceneHost) return;
    sceneHost.querySelectorAll('.qv2-spot').forEach(function (spot) {
      spot.classList.remove('qv2-step-pulse');
    });
  }

  function runThreeStepSequence(blocks, steps, done) {
    var token = ++animationToken;
    var gap = REDUCED ? 0 : 780;

    function show(index) {
      if (token !== animationToken) return;
      if (index >= blocks.length) {
        clearPulses();
        if (done) done();
        return;
      }
      blocks[index].classList.add('is-visible');
      if (steps[index].paint) steps[index].paint();
      if (steps[index].ids) pulseIds(steps[index].ids);
      if (REDUCED) show(index + 1);
      else setTimeout(function () { show(index + 1); }, gap);
    }

    show(0);
  }

  function renderResult(result) {
    animationToken++;
    side.textContent = '';
    paintScene(stagedStates(result, []));

    var data = SCENARIO_META[input.event];
    var header = el('div', 'qv2-side-header');
    header.appendChild(el('p', 'qv2-kicker', data.title));
    header.appendChild(el('h2', '', result.counts.affected + ' of ' + result.total + ' systems are affected'));
    header.appendChild(el('p', 'qv2-side-intro', data.result));
    side.appendChild(header);

    var stateLabel = el('p', 'qv2-state-label', 'Before crypto agility');
    side.appendChild(stateLabel);

    var flow = el('div', 'qv2-comparison-flow qv2-before-flow');

    var reconnaissance = resultBlock('Reconnaissance');
    reconnaissance.appendChild(resultStat(result.counts.unknown, 'missing from the records'));
    flow.appendChild(reconnaissance);

    var resilience = resultBlock('Resilience');
    var beforeTime = el('p', 'qv2-agility-time');
    if (result.days.fragmented > 0) {
      beforeTime.innerHTML = '<span class="qv2-new-stat">' + result.days.fragmented + ' days</span>';
      resilience.appendChild(beforeTime);
      resilience.appendChild(el('p', 'qv2-agility-detail', 'one by one'));
    } else {
      resilience.appendChild(el('p', 'qv2-agility-stat', 'Nothing can be changed directly'));
    }
    resilience.appendChild(el('p', 'qv2-agility-detail', result.counts.exposed + ' can be changed now'));
    flow.appendChild(resilience);

    var reporting = resultBlock('Reporting');
    reporting.appendChild(resultStat(result.counts.blocked, 'waiting on suppliers or hardware'));
    flow.appendChild(reporting);

    side.appendChild(flow);

    var actions = el('div', 'qv2-result-actions qv2-segment');
    var replay = el('button', 'qv2-primary', 'Replay with crypto agility');
    replay.type = 'button';
    replay.addEventListener('click', replayWithAgility);

    var secondary = el('div', 'qv2-secondary-actions');
    var another = el('button', 'qv2-link', 'Try another scenario');
    another.type = 'button';
    another.addEventListener('click', openScenarioOverlay);
    var adjust = el('button', 'qv2-link', 'Adjust starting point');
    adjust.type = 'button';
    adjust.addEventListener('click', renderReadiness);
    secondary.appendChild(another);
    secondary.appendChild(adjust);
    actions.appendChild(replay);
    actions.appendChild(secondary);
    side.appendChild(actions);

    runThreeStepSequence(
      [reconnaissance, resilience, reporting],
      [
        {
          ids: idsForState(result.states, ['unknown']),
          paint: function () { paintScene(stagedStates(result, ['unknown'])); }
        },
        {
          ids: idsForState(result.states, ['exposed']),
          paint: function () { paintScene(stagedStates(result, ['unknown', 'exposed'])); }
        },
        {
          ids: idsForState(result.states, ['blocked']),
          paint: function () { paintScene(result.states); }
        }
      ],
      function () {
        actions.classList.add('is-visible');
      }
    );
  }

  function replayWithAgility() {
    if (!currentResult) return;

    animationToken++;
    var before = currentResult;
    var reconInput = Object.assign({}, input, { recon: true, orch: input.orch });
    var reconResult = simulate(reconInput);
    var agileInput = Object.assign({}, input, { recon: true, orch: 90 });
    var after = simulate(agileInput);
    var discoveredIds = Object.keys(before.states).filter(function (id) {
      return before.states[id] === 'unknown' && after.states[id] !== 'unknown';
    });
    var discovered = discoveredIds.length;
    var outside = after.counts.blocked + after.counts.unknown;
    var finalStates = resolvedStates(after);

    side.textContent = '';
    paintScene(before.states);

    var header = el('div', 'qv2-side-header');
    header.appendChild(el('p', 'qv2-kicker', 'With crypto agility'));
    header.appendChild(el('h2', '', 'Crypto agility helps by'));
    side.appendChild(header);

    var flow = el('div', 'qv2-comparison-flow qv2-agility-flow');

    var recon = resultBlock('Reconnaissance');
    recon.appendChild(resultStat(discovered, 'previously unknown systems identified'));
    recon.appendChild(el('p', 'qv2-agility-detail', before.counts.unknown + ' missing from the records -> ' + after.counts.unknown));
    flow.appendChild(recon);

    var resilience = resultBlock('Resilience');
    var time = el('p', 'qv2-agility-time');
    if (after.days.fragmented > 0) {
      time.innerHTML = '<span class="qv2-new-stat">' + after.days.agile + ' days</span><s class="qv2-old-stat">' + after.days.fragmented + ' days</s>';
    } else {
      time.textContent = 'The same limits remain';
    }
    resilience.appendChild(time);
    if (after.days.fragmented > 0 && after.days.fragmented !== before.days.fragmented) {
      resilience.appendChild(el('p', 'qv2-agility-detail', 'The crossed-out time is the same newly discovered workload one by one.'));
    }
    resilience.appendChild(el('p', 'qv2-agility-detail', after.counts.exposed + ' systems changed centrally'));
    flow.appendChild(resilience);

    var reporting = resultBlock('Reporting');
    reporting.appendChild(resultStat(outside, 'still outside direct reach'));
    flow.appendChild(reporting);

    side.appendChild(flow);

    var finish = el('div', 'qv2-result-actions qv2-segment');
    var note = el('p', 'qv2-timing');
    if (outside > 0) {
      note.textContent = 'Limitation: crypto agility does not replace the need to update systems and suppliers.';
    } else {
      note.textContent = 'Every affected system in this run is visible and reachable.';
    }
    finish.appendChild(note);

    var rewind = el('button', 'qv2-link qv2-rewind', 'Rewind without crypto agility');
    rewind.type = 'button';
    rewind.addEventListener('click', function () {
      input.recon = false;
      renderResult(currentResult);
    });
    finish.appendChild(rewind);

    var another = el('button', 'qv2-primary', 'Try another scenario');
    another.type = 'button';
    another.addEventListener('click', openScenarioOverlay);
    finish.appendChild(another);

    var cta = document.createElement('a');
    cta.className = 'qv2-text-cta';
    cta.href = 'https://www.qusecure.com';
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = INDUSTRY_CTA[input.industry] + ' ->';
    finish.appendChild(cta);
    side.appendChild(finish);

    var reconPaint = Object.assign({}, before.states);
    discoveredIds.forEach(function (id) { reconPaint[id] = reconResult.states[id]; });

    runThreeStepSequence(
      [recon, resilience, reporting],
      [
        {
          ids: discoveredIds,
          paint: function () { paintScene(reconPaint); }
        },
        {
          ids: idsForState(after.states, ['exposed']),
          paint: function () { paintScene(finalStates); }
        },
        {
          ids: idsForState(after.states, ['blocked', 'unknown']),
          paint: function () { paintScene(finalStates); }
        }
      ],
      function () {
        finish.classList.add('is-visible');
      }
    );
  }

  function paintScene(states) {
    if (!sceneHost) return;
    sceneHost.querySelectorAll('.qv2-spot').forEach(function (spot) {
      var state = states && states[spot.dataset.id] ? states[spot.dataset.id] : 'dim';
      spot.dataset.state = state;
    });

    sceneHost.querySelectorAll('.qv2-links path').forEach(function (path) {
      var a = states && states[path.dataset.from];
      var b = states && states[path.dataset.to];
      var bad = ['exposed', 'blocked', 'unknown'];
      path.classList.toggle('is-hot', bad.indexOf(a) >= 0 || bad.indexOf(b) >= 0);
      path.classList.toggle('is-calm', (a === 'protected' || a === 'resolved') && (b === 'protected' || b === 'resolved'));
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  buildApp();
})();
