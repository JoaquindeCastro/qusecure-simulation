/* Production model revision for the replacement Q-Day Simulation UI.
   The original pure model remains in index.html for the legacy hidden interface.
   This file overrides the live model before assets/feedback.js loads. */

var READINESS_TARGETS = {
  health: {
    none: [],
    edge: ['ems', 'clinic'],
    pilot: ['ems', 'clinic', 'ehr'],
    orchestrated: ['ems', 'clinic', 'ehr', 'core', 'telehealth', 'pharmacy', 'datacenter']
  },
  finance: {
    none: [],
    edge: ['transport', 'payments'],
    pilot: ['transport', 'payments', 'core'],
    orchestrated: ['transport', 'payments', 'core', 'branch', 'trading', 'identity', 'datacenter']
  },
  gov: {
    none: [],
    edge: ['citizens'],
    pilot: ['citizens', 'core'],
    orchestrated: ['citizens', 'core', 'agency', 'secureops', 'soc', 'datacenter']
  },
  infra: {
    none: [],
    edge: ['field'],
    pilot: ['field', 'opscenter'],
    orchestrated: ['field', 'opscenter', 'scada', 'plant', 'refinery', 'pipeline', 'water']
  }
};

/* Keep the legacy ADOPTION object available, but identify the live readiness keys explicitly. */
ADOPTION.none = {
  label: 'None / Not sure',
  blurb: 'No post-quantum migration is assumed.',
  coverage: {},
  key: 'none'
};
Object.keys(ADOPTION).forEach(function (key) {
  ADOPTION[key].key = key;
});

/* The generic proto flag is no longer part of the production model. */
Object.keys(SCENES).forEach(function (industry) {
  SCENES[industry].assets.forEach(function (asset) {
    if (Object.prototype.hasOwnProperty.call(asset, 'proto')) delete asset.proto;
  });
});

function liveIndustryKey(assets) {
  var keys = Object.keys(SCENES);
  for (var i = 0; i < keys.length; i++) {
    if (SCENES[keys[i]].assets === assets) return keys[i];
  }
  return typeof input !== 'undefined' && input.industry ? input.industry : 'health';
}

function setFromIds(ids) {
  var out = {};
  ids.forEach(function (id) { out[id] = true; });
  return out;
}

function addSet(target, source) {
  Object.keys(source).forEach(function (id) { target[id] = true; });
  return target;
}

function baseKnownSet(assets, simInput) {
  var known = {};
  if (simInput && simInput.recon) {
    assets.forEach(function (asset) { known[asset.id] = true; });
    return known;
  }

  var byBand = groupByBand(assets);
  Object.keys(byBand).forEach(function (band) {
    var list = byBand[band];
    var visibility = (simInput.inventory / 100) * (band === 'legacy' ? LEGACY_VISIBILITY : 1);
    list.forEach(function (asset, index) {
      if (within(index, list.length, visibility, band)) known[asset.id] = true;
    });
  });
  return known;
}

/* A claimed migration target is necessarily known. Broad migration means every known system
   has been migrated, while still allowing inventory blind spots to exist. */
function readinessKnownSet(assets, adoptionKey, simInput) {
  var industry = liveIndustryKey(assets);
  var known = baseKnownSet(assets, simInput);
  var targets = READINESS_TARGETS[industry] || READINESS_TARGETS.health;

  if (adoptionKey === 'native') {
    addSet(known, setFromIds(targets.orchestrated || []));
    return known;
  }

  addSet(known, setFromIds(targets[adoptionKey] || []));
  return known;
}

/* Public helper used by the live readiness screen and the patched simulation. */
function migrationSet(assets, adoptionKey, simInput) {
  var industry = liveIndustryKey(assets);
  var targets = READINESS_TARGETS[industry] || READINESS_TARGETS.health;

  if (adoptionKey === 'native') {
    /* Broad migration covers everything that was known before reconnaissance.
       Reconnaissance can discover additional systems, but discovery does not retroactively migrate them. */
    var migrationInput = Object.assign({}, simInput, { recon: false });
    return readinessKnownSet(assets, adoptionKey, migrationInput);
  }
  return setFromIds(targets[adoptionKey] || []);
}

/* Compatibility for any live code that still calls coveredSet with ADOPTION coverage. */
coveredSet = function (assets, profile) {
  var adoptionKey = profile && profile.key ? profile.key : (typeof input !== 'undefined' ? input.adoption : 'none');
  var simInput = typeof input !== 'undefined' ? input : {
    industry: liveIndustryKey(assets), inventory: 65, adoption: adoptionKey
  };
  return migrationSet(assets, adoptionKey, simInput);
};

function quantumVulnerableAsset(asset) {
  return asset.dep.indexOf('pk') >= 0 || asset.dep.indexOf('sig') >= 0 || asset.dep.indexOf('cert') >= 0;
}

/* Concrete compliance event. It no longer depends on a generic proto tag. */
EVENTS.tls = {
  label: 'PQC migration deadline',
  tag: 'Migration deadline',
  blurb: 'A hard deadline makes quantum-vulnerable public-key cryptography no longer permitted.',
  properties: 'availability and compliance standing',
  kind: 'compliance',
  stresses: ['availability', 'compliance'],
  plain: 'Systems still using quantum-vulnerable cryptography must change or be switched off.',
  hits: function (asset, context) {
    return !context.covered[asset.id] && quantumVulnerableAsset(asset);
  }
};

/* This scenario explicitly assumes the deployed PQC implementation is the vulnerable one. */
EVENTS.mlkem = {
  label: 'PQC vulnerability found',
  tag: 'Migrate again',
  blurb: 'A serious vulnerability is found in the PQC implementation the organization deployed.',
  properties: 'confidentiality',
  kind: 'vulnerability',
  stresses: ['confidentiality'],
  assumption: 'The deployed PQC implementation is the vulnerable implementation.',
  plain: 'Systems that adopted the vulnerable PQC implementation must move again.',
  hits: function (asset, context) {
    return !!context.covered[asset.id];
  }
};

/* Q-Day continues to model a technical break in quantum-vulnerable public-key cryptography. */
EVENTS.qday.hits = function (asset, context) {
  return !context.covered[asset.id] && quantumVulnerableAsset(asset);
};

simulate = function (simInput) {
  var scene = SCENES[simInput.industry];
  var assets = scene.assets;
  var n = assets.length;
  var covered = migrationSet(assets, simInput.adoption, simInput);
  var known = readinessKnownSet(assets, simInput.adoption, simInput);

  var event = EVENTS[simInput.event];
  var context = { covered: covered };
  var directly = assets.filter(function (asset) { return event.hits(asset, context); });
  var directIds = {};
  directly.forEach(function (asset) { directIds[asset.id] = true; });

  var states = {};
  var exposed = [];
  var blockedVendor = [];
  var blockedLegacy = [];
  var unknown = [];
  var vendorSeen = 0;

  directly.forEach(function (asset) {
    if (!known[asset.id]) {
      states[asset.id] = 'unknown';
      unknown.push(asset);
      return;
    }
    if (asset.legacy) {
      states[asset.id] = 'blocked';
      blockedLegacy.push(asset);
      return;
    }
    if (asset.vendor) {
      var gate = vendorGate(vendorSeen++);
      if (simInput.vendor < gate) {
        states[asset.id] = 'blocked';
        blockedVendor.push(asset);
        return;
      }
    }
    states[asset.id] = 'exposed';
    exposed.push(asset);
  });

  var dependent = [];
  scene.links.forEach(function (link) {
    [[link[0], link[1]], [link[1], link[0]]].forEach(function (pair) {
      if (directIds[pair[0]] && !directIds[pair[1]] && !states[pair[1]]) {
        states[pair[1]] = 'dependent';
        dependent.push(pair[1]);
      }
    });
  });

  assets.forEach(function (asset) {
    if (!states[asset.id]) states[asset.id] = covered[asset.id] ? 'protected' : 'ok';
  });

  var properties = {};
  directly.forEach(function (asset) {
    var has = {};
    asset.dep.forEach(function (dependency) {
      (PROPERTY_OF[dependency] || []).forEach(function (property) { has[property] = true; });
    });
    event.stresses.forEach(function (property) {
      if (property === 'compliance' || has[property]) {
        properties[property] = (properties[property] || 0) + 1;
      }
    });
  });

  var retro = directly.filter(function (asset) {
    return event.stresses.indexOf('confidentiality') >= 0 && asset.band === 'keys' && asset.dep.indexOf('pk') >= 0;
  });

  var load = exposed.reduce(function (total, asset) {
    return total + (BAND_EFFORT[asset.band] || 1);
  }, 0);
  var capacity = Math.pow(simInput.teams, TEAM_RETURNS);
  var fragmented = Math.ceil(load * (WORK_PER_SYSTEM + COORD_PER_SYSTEM) / capacity);
  var agile = Math.ceil(
    load * (
      WORK_PER_SYSTEM * (1 - WORK_AGILITY * simInput.orch / 100) +
      COORD_PER_SYSTEM * (1 - COORD_AGILITY * simInput.orch / 100)
    ) / capacity
  );
  var residual = blockedVendor.length ? Math.round(45 + (100 - simInput.vendor) * 0.9) : 0;
  var reach = directly.length ? Math.round(100 * exposed.length / directly.length) : 100;

  return {
    states: states,
    total: n,
    event: event,
    industry: scene.name,
    horizon: simInput.horizon,
    counts: {
      exposed: exposed.length,
      unknown: unknown.length,
      dependent: dependent.length,
      blocked: blockedVendor.length + blockedLegacy.length,
      blockedVendor: blockedVendor.length,
      blockedLegacy: blockedLegacy.length,
      affected: directly.length,
      protected: Object.keys(covered).length,
      known: Object.keys(known).length,
      retro: retro.length
    },
    names: {
      exposed: exposed.map(function (asset) { return asset.name; }),
      blockedLegacy: blockedLegacy.map(function (asset) { return asset.name; }),
      blockedVendor: blockedVendor.map(function (asset) { return asset.name; }),
      unknown: unknown.map(function (asset) { return asset.name; }),
      retro: retro.map(function (asset) { return asset.name; })
    },
    properties: properties,
    days: { fragmented: fragmented, agile: agile, residual: residual },
    reach: reach
  };
};
