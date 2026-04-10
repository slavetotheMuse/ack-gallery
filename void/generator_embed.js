/* ═══════════════════════════════════════════════════════════════
   GENERATOR EMBED — full-screen overlay version of generator.html
   Loaded by oneofone_full.html and exhibition.html
   Requires: trait_data_24.js (TRAIT_B64) loaded BEFORE this file.
   Exposes: window.openGenerator(), window.closeGenerator()
   All state lives inside the IIFE — no leakage to host page.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ─── Trait config (mirrors generator.html) ───
  var TRAIT_BASE = '../../../argonauts_new/';
  var traits = {
    background: {
      folder: TRAIT_BASE + 'background/',
      files: ['BLUSH.png','OFFWHITE.png','PUNKBLUE.png','yellow_new.png','ancient.png','blackgrey.png','bubblegum.png','MuseGreen.png','alien_ice_prism.png','alien_wide_violet.png'],
      optional: false
    },
    body: {
      folder: TRAIT_BASE + 'BODY/new_body/',
      files: ['alienfixed.png','common_bone_2.png','common_bone.png','coral.png','flowers_bare.png','flowers_with.png','gold.png','petrified.png','radioactive.png','silver.png'],
      optional: false
    },
    hoodie: { folder: TRAIT_BASE + 'Hoodie/',  files: ['Black.png','servant.png'], optional: true },
    neck:   { folder: TRAIT_BASE + 'neck/',    files: ['gold.png'], optional: true },
    eyes:   { folder: TRAIT_BASE + 'eyes/',    files: ['3D GLASSES.png','Alien_eyepatch.png','Glasses.png','cozomo.png','digital_frames.png','eyepatch.png','shades.png'], optional: true },
    mouth:  { folder: TRAIT_BASE + 'mouth/',   files: ['vape2.png','woodpipe.png'], optional: true },
    head:   { folder: TRAIT_BASE + 'Head/',    files: ['Orange Beanie.png','bandana.png','golden_fleece.png','headband.png','purphat.png'], optional: true }
  };

  var currentTraits = {
    background:null, body:null,
    hoodie:'none', neck:'none', eyes:'none', mouth:'none', head:'none'
  };

  var imageCache = {};
  var isRapidMode = false;
  var rapidInterval = null;
  var renderedCount = 0;

  // ─── Alien glow config ───
  var alienBackgrounds = [
    'alien_ice_prism_pink','alien_violet_pink','alien_violet_cyan',
    'alien_navy_pink','alien_void_pink','alien_void_blue',
    'alien_void_cyan','alien_vig_navy_blue','alien_vig_void_teal'
  ];
  var alienBgWeights = [12,14,14,10,12,12,12,7,7];
  var normalBackgrounds = ['BLUSH.png','OFFWHITE.png','PUNKBLUE.png','yellow_new.png','ancient.png','blackgrey.png','bubblegum.png','MuseGreen.png'];

  var alienGlowConfig = {
    'alien_ice_prism_pink':  { bgType:'file', bgFile:'alien_ice_prism.png',    glowColor:[255,140,180], glowR:14, glowS:0.5 },
    'alien_violet_pink':     { bgType:'file', bgFile:'alien_wide_violet.png',  glowColor:[255,140,180], glowR:14, glowS:0.5 },
    'alien_violet_cyan':     { bgType:'file', bgFile:'alien_wide_violet.png',  glowColor:[100,240,220], glowR:14, glowS:0.5 },
    'alien_navy_pink':       { bgType:'solid', bgColor:[15,18,40],             glowColor:[255,140,180], glowR:14, glowS:0.5 },
    'alien_void_pink':       { bgType:'solid', bgColor:[8,8,12],               glowColor:[255,140,180], glowR:14, glowS:0.5 },
    'alien_void_blue':       { bgType:'solid', bgColor:[8,8,12],               glowColor:[120,180,255], glowR:14, glowS:0.5 },
    'alien_void_cyan':       { bgType:'solid', bgColor:[8,8,12],               glowColor:[100,240,220], glowR:14, glowS:0.5 },
    'alien_vig_navy_blue':   { bgType:'vignette', bgCenter:[25,30,60], bgEdge:[5,5,15],   glowColor:[120,180,255], glowR:14, glowS:0.5 },
    'alien_vig_void_teal':   { bgType:'vignette', bgCenter:[20,20,25], bgEdge:[2,2,4],    glowColor:[80,220,200],  glowR:16, glowS:0.6 }
  };
  var alienBgNoBlackHoodie = ['alien_navy_pink','alien_vig_navy_blue','alien_vig_void_teal'];

  // ─── Rarity weights ───
  var traitRarity = {
    body: {
      'alienfixed.png':    { weight:7,    tier:'Legendary',  color:'#23a6cb' },
      'radioactive.png':   { weight:24,   tier:'Mythic',     color:'#78ff4c' },
      'gold.png':          { weight:88,   tier:'Ultra Rare', color:'#dfb747' },
      'petrified.png':     { weight:300,  tier:'Rare',       color:'#b0a090' },
      'flowers_bare.png':  { weight:500,  tier:'Uncommon+',  color:'#ff88aa' },
      'coral.png':         { weight:800,  tier:'Uncommon',   color:'#ff7766' },
      'silver.png':        { weight:1300, tier:'Common+',    color:'#c0c0c0' },
      'common_bone_2.png': { weight:2500, tier:'Common',     color:'#aa8855' },
      'common_bone.png':   { weight:4481, tier:'Base',       color:'#6b5d4d' }
    },
    background: {
      'bubblegum.png':  { weight:4,  tier:'Ultra Rare', color:'#ff66aa' },
      'yellow_new.png': { weight:6,  tier:'Rare+',      color:'#ccaa44' },
      'blackgrey.png':  { weight:8,  tier:'Rare',       color:'#888888' },
      'MuseGreen.png':  { weight:10, tier:'Rare',       color:'#44cc88' },
      'ancient.png':    { weight:12, tier:'Uncommon',   color:'#8a7a5a' },
      'PUNKBLUE.png':   { weight:16, tier:'Uncommon',   color:'#5588cc' },
      'BLUSH.png':      { weight:20, tier:'Common',     color:'#cc8888' },
      'OFFWHITE.png':   { weight:22, tier:'Common',     color:'#ddd8cc' },
      'alien_ice_prism_pink':  { weight:0, tier:'Legendary', color:'#ffb0c8' },
      'alien_violet_pink':     { weight:0, tier:'Legendary', color:'#ff8cb4' },
      'alien_violet_cyan':     { weight:0, tier:'Legendary', color:'#64f0dc' },
      'alien_navy_pink':       { weight:0, tier:'Legendary', color:'#ff8cb4' },
      'alien_void_pink':       { weight:0, tier:'Legendary', color:'#ff8cb4' },
      'alien_void_blue':       { weight:0, tier:'Legendary', color:'#78b4ff' },
      'alien_void_cyan':       { weight:0, tier:'Legendary', color:'#64f0dc' },
      'alien_vig_navy_blue':   { weight:0, tier:'Legendary', color:'#78b4ff' },
      'alien_vig_void_teal':   { weight:0, tier:'Legendary', color:'#50dcc8' }
    },
    hoodie: {
      'none':         { weight:820, tier:null, color:null },
      'servant.png':  { weight:78,  tier:'Rare',   color:'#be8c25' },
      'Black.png':    { weight:102, tier:'Common', color:'#444444' }
    },
    neck: {
      'none':      { weight:880, tier:null, color:null },
      'gold.png':  { weight:120, tier:'Uncommon', color:'#dfb747' }
    },
    eyes: {
      'none':                 { weight:635, tier:null, color:null },
      'shades.png':           { weight:70,  tier:'Common',     color:'#333333' },
      'Glasses.png':          { weight:60,  tier:'Common',     color:'#8888aa' },
      'digital_frames.png':   { weight:55,  tier:'Common+',    color:'#44ccff' },
      'eyepatch.png':         { weight:50,  tier:'Uncommon',   color:'#554433' },
      '3D GLASSES.png':       { weight:45,  tier:'Uncommon',   color:'#ff4444' },
      'cozomo.png':           { weight:35,  tier:'Rare',       color:'#aa66dd' },
      'Alien_eyepatch.png':   { weight:30,  tier:'Rare',       color:'#23a6cb' }
    },
    mouth: {
      'none':          { weight:780, tier:null, color:null },
      'woodpipe.png':  { weight:130, tier:'Uncommon', color:'#8B6914' },
      'vape2.png':     { weight:90,  tier:'Rare',     color:'#aaddff' }
    },
    head: {
      'none':               { weight:630, tier:null, color:null },
      'headband.png':       { weight:65,  tier:'Common',     color:'#cc4444' },
      'bandana.png':        { weight:55,  tier:'Common+',    color:'#4466aa' },
      'Orange Beanie.png':  { weight:50,  tier:'Uncommon',   color:'#ff8833' },
      'purphat.png':        { weight:50,  tier:'Uncommon+',  color:'#8844cc' },
      'golden_fleece.png':  { weight:50,  tier:'Rare',       color:'#dfb747' }
    }
  };

  var hiddenFromSelector = { 'flowers_bare.png': true };
  var thumbNames = {
    'flowers_with.png':'Floral','alienfixed.png':'Alien','common_bone_2.png':'Prehistoric',
    'common_bone.png':'Bone','yellow_new.png':'Yellow','alien_ice_prism.png':'Ice Prism',
    'alien_wide_violet.png':'Wide Violet','digital_frames.png':'Digital','Alien_eyepatch.png':'Eye Patch',
    'eyepatch.png':'Eye Patch','3D GLASSES.png':'3D Glasses','Black.png':'Death','cozomo.png':'Designer',
    'Orange Beanie.png':'Orange Bean.','golden_fleece.png':'Gold Fleece','vape2.png':'Vape',
    'woodpipe.png':'Pipe','blackgrey.png':'Void'
  };

  // ─── Markup builder ───
  function buildOverlayMarkup(){
    var div = document.createElement('div');
    div.className = 'gen-overlay';
    div.id = 'genOverlay';
    div.innerHTML =
      '<button class="gen-fixed-close" id="genFixedCloseBtn" title="Close (Esc)">\u2715  Back</button>' +
      '<div class="gen-nav">' +
        '<div class="gen-nav-brand">' +
          '<img src="ack_logo.png" alt="ACK">' +
          '<span>Argonauts &middot; Generator</span>' +
        '</div>' +
        '<button class="gen-nav-close" id="genCloseBtn">\u2190 Back</button>' +
      '</div>' +
      '<div class="gen-header">' +
        '<h1>Generator</h1>' +
        '<div class="gen-sub">Compose &amp; Preview Argonaut Trait Combinations</div>' +
        '<div class="gen-stats">' +
          '<div><div class="gen-stat-label">Combinations</div><div class="gen-stat-value">22,680</div></div>' +
          '<div><div class="gen-stat-label">Trait Layers</div><div class="gen-stat-value">7</div></div>' +
          '<div><div class="gen-stat-label">Rendered</div><div class="gen-stat-value" id="genRenderedCount">0</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="gen-container">' +
        '<div class="gen-main" id="genGeneratorMode">' +
          '<div class="preview-col">' +
            '<div class="preview-frame"><div class="preview-inner">' +
              '<img id="genPreviewImg" width="480" height="480">' +
            '</div></div>' +
            '<div class="traits-readout">' +
              '<div class="trait-row"><div class="trait-label-r">Palette:</div><div class="trait-value-r" id="genTraitBackground">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Bones:</div><div class="trait-value-r" id="genTraitBody">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Cloak:</div><div class="trait-value-r" id="genTraitHoodie">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Relic:</div><div class="trait-value-r" id="genTraitNeck">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Sight:</div><div class="trait-value-r" id="genTraitEyes">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Artifact:</div><div class="trait-value-r" id="genTraitMouth">&mdash;</div></div>' +
              '<div class="trait-row"><div class="trait-label-r">Crown:</div><div class="trait-value-r" id="genTraitHead">&mdash;</div></div>' +
            '</div>' +
            '<div class="btn-group">' +
              '<button class="gen-btn" data-act="render">Render</button>' +
              '<button class="gen-btn" data-act="save">Save</button>' +
              '<button class="gen-btn" data-act="batch">Batch Render</button>' +
              '<button class="gen-btn" data-act="crew">Crew</button>' +
              '<button class="gen-btn" data-act="rapid" id="genRapidBtn">Rapid</button>' +
            '</div>' +
          '</div>' +
          '<div class="controls-col">' +
            '<div class="trait-selector"><div class="trait-cat-title">Palette</div><div class="trait-thumbs" id="genSelBackground"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Bones</div><div class="trait-thumbs" id="genSelBody"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Cloak</div><div class="trait-thumbs" id="genSelHoodie"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Relic</div><div class="trait-thumbs" id="genSelNeck"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Sight</div><div class="trait-thumbs" id="genSelEyes"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Artifact</div><div class="trait-thumbs" id="genSelMouth"></div></div>' +
            '<div class="trait-selector"><div class="trait-cat-title">Crown</div><div class="trait-thumbs" id="genSelHead"></div></div>' +
          '</div>' +
        '</div>' +
        '<div id="genCrewMode">' +
          '<div class="crew-header">' +
            '<h2>The Crew</h2>' +
            '<div class="crew-sub">12 random compositions from the trait pool</div>' +
            '<div class="crew-controls">' +
              '<button class="gen-btn" data-act="crewNew">New Crew</button>' +
              '<button class="gen-btn" data-act="back">Back</button>' +
            '</div>' +
          '</div>' +
          '<div class="crew-grid" id="genCrewGrid"></div>' +
        '</div>' +
        '<div id="genBatchMode">' +
          '<div class="batch-header">' +
            '<h2>Batch Render</h2>' +
            '<div class="batch-sub">Generate and download multiple renders at once</div>' +
            '<div class="batch-controls">' +
              '<button class="gen-btn" data-act="batch6">Render 6</button>' +
              '<button class="gen-btn" data-act="batch12">Render 12</button>' +
              '<button class="gen-btn" data-act="batch24">Render 24</button>' +
              '<button class="gen-btn" data-act="back">Back</button>' +
            '</div>' +
          '</div>' +
          '<div class="batch-grid" id="genBatchGrid"></div>' +
          '<div class="batch-download-all" id="genBatchDownloadAll" style="display:none;">' +
            '<button class="gen-btn" data-act="downloadAll">Save All</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return div;
  }

  // ─── Init helpers ───
  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  var idForCat = {
    background:'genSelBackground', body:'genSelBody', hoodie:'genSelHoodie',
    neck:'genSelNeck', eyes:'genSelEyes', mouth:'genSelMouth', head:'genSelHead'
  };
  var traitDispIds = {
    body:'genTraitBody', background:'genTraitBackground', hoodie:'genTraitHoodie',
    neck:'genTraitNeck', eyes:'genTraitEyes', mouth:'genTraitMouth', head:'genTraitHead'
  };

  function initTraitSelector(traitName, traitData){
    var sel = document.getElementById(idForCat[traitName]);
    if(!sel) return;
    if(traitData.optional) sel.appendChild(createThumb(traitName,'none'));
    for(var i=0;i<traitData.files.length;i++){
      if(hiddenFromSelector[traitData.files[i]]) continue;
      sel.appendChild(createThumb(traitName, traitData.files[i]));
    }
  }

  function createThumb(traitName, file){
    var div = document.createElement('div');
    div.className = 'trait-thumb';
    div.addEventListener('click', function(){ selectTrait(traitName, file); });
    var imgC = document.createElement('div');
    imgC.className = 'thumb-img';
    if(file !== 'none'){
      var img = document.createElement('img');
      var b64Key = traitName + '/' + file;
      img.src = (typeof TRAIT_B64 !== 'undefined' && TRAIT_B64[b64Key]) ? TRAIT_B64[b64Key] : traits[traitName].folder + file;
      img.alt = file;
      imgC.appendChild(img);
    } else {
      imgC.textContent = '\u2014';
      imgC.style.color = 'var(--ink-faint)';
      imgC.style.fontSize = '18px';
    }
    var label = document.createElement('div');
    label.className = 'thumb-label';
    label.textContent = file === 'none' ? 'bare' : (thumbNames[file] || file.replace('.png','').substring(0,12));
    div.appendChild(imgC);
    div.appendChild(label);
    div.dataset.trait = traitName;
    div.dataset.file = file;
    return div;
  }

  function selectTrait(traitName, file){
    currentTraits[traitName] = file;
    applyTraitRules();
    updateSelectors();
    renderPreview();
  }

  function updateSelectors(){
    for(var tn in currentTraits){
      if(!currentTraits.hasOwnProperty(tn)) continue;
      var val = currentTraits[tn];
      if(val === 'flowers_bare.png') val = 'flowers_with.png';
      var thumbs = document.querySelectorAll('#genOverlay [data-trait="'+tn+'"]');
      for(var i=0;i<thumbs.length;i++){
        if(thumbs[i].dataset.file === val) thumbs[i].classList.add('selected');
        else thumbs[i].classList.remove('selected');
      }
    }
  }

  // ─── Randomize ───
  function randomizeTraits(){
    currentTraits.background = weightedRoll('background');
    currentTraits.body       = weightedRoll('body');
    currentTraits.hoodie     = weightedRoll('hoodie');
    currentTraits.neck       = weightedRoll('neck');
    currentTraits.eyes       = weightedRoll('eyes');
    currentTraits.mouth      = weightedRoll('mouth');
    currentTraits.head       = weightedRoll('head');
    applyTraitRules();
    renderedCount++;
    var rc = document.getElementById('genRenderedCount');
    if(rc) rc.textContent = renderedCount;
    updateSelectors();
    renderPreview();
  }

  function weightedRoll(category){
    var table = traitRarity[category];
    if(!table) return 'none';
    var totalWeight = 0;
    for(var k in table) totalWeight += table[k].weight;
    var roll = Math.random() * totalWeight, cumulative = 0;
    for(var k2 in table){
      cumulative += table[k2].weight;
      if(roll < cumulative) return k2;
    }
    return Object.keys(table)[0];
  }

  function weightedAlienBgRoll(){
    var total = 0;
    for(var i=0;i<alienBgWeights.length;i++) total += alienBgWeights[i];
    var roll = Math.random() * total, cum = 0;
    for(var j=0;j<alienBackgrounds.length;j++){
      cum += alienBgWeights[j];
      if(roll < cum) return alienBackgrounds[j];
    }
    return alienBackgrounds[0];
  }

  // ─── Trait rules ───
  function applyTraitRules(){
    if(currentTraits.body === 'alienfixed.png'){
      if(alienBackgrounds.indexOf(currentTraits.background) === -1)
        currentTraits.background = weightedAlienBgRoll();
    } else {
      if(alienBackgrounds.indexOf(currentTraits.background) !== -1){
        currentTraits.background = weightedRoll('background');
        if(alienBackgrounds.indexOf(currentTraits.background) !== -1)
          currentTraits.background = normalBackgrounds[Math.floor(Math.random()*normalBackgrounds.length)];
      }
    }
    if(alienBgNoBlackHoodie.indexOf(currentTraits.background) !== -1 && currentTraits.hoodie === 'Black.png')
      currentTraits.hoodie = 'none';
    if(currentTraits.hoodie !== 'none' && currentTraits.head !== 'none'){
      if(Math.random() > 0.5) currentTraits.head = 'none';
      else currentTraits.hoodie = 'none';
    }
    if(currentTraits.body === 'coral.png') currentTraits.hoodie = 'none';
    if(currentTraits.body !== 'alienfixed.png' && currentTraits.eyes === 'Alien_eyepatch.png') currentTraits.eyes = 'none';
    if(currentTraits.body === 'alienfixed.png' && currentTraits.eyes === 'digital_frames.png') currentTraits.eyes = 'none';
    if(currentTraits.body === 'alienfixed.png' && (currentTraits.eyes === 'eyepatch.png' || currentTraits.eyes === 'Alien_eyepatch.png' || currentTraits.eyes === 'shades.png')) currentTraits.eyes = 'none';
    if((currentTraits.body === 'radioactive.png' || currentTraits.body === 'flowers_bare.png' || currentTraits.body === 'flowers_with.png') && currentTraits.eyes === 'shades.png') currentTraits.eyes = 'none';
    if((currentTraits.body === 'flowers_bare.png' || currentTraits.body === 'flowers_with.png') && currentTraits.eyes === 'digital_frames.png') currentTraits.eyes = 'none';
    if(currentTraits.body !== 'gold.png' && currentTraits.head === 'golden_fleece.png') currentTraits.head = 'none';
    if((currentTraits.body === 'gold.png' || currentTraits.body === 'alienfixed.png') && currentTraits.neck === 'gold.png') currentTraits.neck = 'none';
    if(currentTraits.background === 'bubblegum.png' && currentTraits.body === 'radioactive.png') currentTraits.body = 'common_bone.png';
    if(currentTraits.background === 'blackgrey.png' && currentTraits.eyes === 'eyepatch.png') currentTraits.eyes = 'none';
    if(currentTraits.background === 'blackgrey.png' && currentTraits.hoodie === 'none' && currentTraits.eyes === 'shades.png') currentTraits.eyes = 'none';
    if(currentTraits.body === 'radioactive.png' && currentTraits.head === 'purphat.png') currentTraits.head = 'none';
    if((currentTraits.body === 'flowers_bare.png' || currentTraits.body === 'flowers_with.png') && currentTraits.head === 'Orange Beanie.png') currentTraits.head = 'none';
    if(currentTraits.body === 'flowers_bare.png' || currentTraits.body === 'flowers_with.png'){
      var hasClothing = (currentTraits.hoodie !== 'none' || (currentTraits.head !== 'none' && currentTraits.head !== 'headband.png'));
      currentTraits.body = hasClothing ? 'flowers_with.png' : 'flowers_bare.png';
    }
  }

  // ─── Image loading (thumbnail originals) ───
  function preloadAllImages(){
    var promises = [];
    for(var tn in traits){
      if(!traits.hasOwnProperty(tn)) continue;
      for(var i=0;i<traits[tn].files.length;i++){
        promises.push(loadImage(traits[tn].folder + traits[tn].files[i]));
      }
    }
    return Promise.all(promises);
  }
  function loadImage(src){
    return new Promise(function(resolve){
      if(imageCache[src]){ resolve(imageCache[src]); return; }
      var img = new Image();
      img.onload = function(){ imageCache[src] = img; resolve(img); };
      img.onerror = function(){ resolve(null); };
      img.src = src;
    });
  }

  function getB64(traitName, file){
    var key = traitName + '/' + file;
    return (typeof TRAIT_B64 !== 'undefined' && TRAIT_B64[key]) ? TRAIT_B64[key] : null;
  }

  // ─── Vignette + SVG render ───
  var vignetteCache = {};
  function makeVignetteB64(center, edge){
    var c = document.createElement('canvas');
    c.width = 24; c.height = 24;
    var ctx = c.getContext('2d');
    var cx = 12, cy = 12, maxDist = Math.sqrt(cx*cx+cy*cy);
    var imgData = ctx.createImageData(24, 24);
    for(var y=0; y<24; y++){
      for(var x=0; x<24; x++){
        var dist = Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy));
        var t = Math.min(dist/maxDist, 1.0); t = Math.pow(t, 1.5);
        var idx = (y*24+x)*4;
        imgData.data[idx]   = Math.round(center[0]*(1-t)+edge[0]*t);
        imgData.data[idx+1] = Math.round(center[1]*(1-t)+edge[1]*t);
        imgData.data[idx+2] = Math.round(center[2]*(1-t)+edge[2]*t);
        imgData.data[idx+3] = 255;
      }
    }
    ctx.putImageData(imgData,0,0);
    return c.toDataURL('image/png');
  }
  function initVignetteCache(){
    for(var key in alienGlowConfig){
      var cfg = alienGlowConfig[key];
      if(cfg.bgType === 'vignette'){
        vignetteCache[key] = makeVignetteB64(cfg.bgCenter, cfg.bgEdge);
      }
    }
  }

  function buildSVG(ts){
    var bgKey = ts.background;
    var isGlowBg = alienGlowConfig.hasOwnProperty(bgKey);
    var images = [];
    var defs = '';

    if(isGlowBg){
      var cfg = alienGlowConfig[bgKey];
      if(cfg.bgType === 'file'){
        var bgB64 = getB64('background', cfg.bgFile);
        if(bgB64) images.push('<image href="'+bgB64+'" width="24" height="24" style="image-rendering:pixelated"/>');
      } else if(cfg.bgType === 'solid'){
        images.push('<rect width="24" height="24" fill="rgb('+cfg.bgColor.join(',')+')"/>');
      } else if(cfg.bgType === 'vignette'){
        var vigB64 = vignetteCache[bgKey];
        if(vigB64) images.push('<image href="'+vigB64+'" width="24" height="24" style="image-rendering:pixelated"/>');
      }
      var gc = cfg.glowColor;
      defs = '<defs><filter id="genglow" x="-80%" y="-80%" width="260%" height="260%">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>' +
        '<feFlood flood-color="rgb('+gc[0]+','+gc[1]+','+gc[2]+')" flood-opacity="'+cfg.glowS.toFixed(2)+'"/>' +
        '<feComposite in2="blur" operator="in" result="glow"/>' +
        '<feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/></feMerge>' +
        '</filter></defs>';
      var layerImgs = [];
      var co = ['body','eyes','hoodie','neck','mouth','head'];
      for(var i=0;i<co.length;i++){
        var f=ts[co[i]]; if(f==='none') continue;
        var b = getB64(co[i], f);
        if(b) layerImgs.push('<image href="'+b+'" width="24" height="24" style="image-rendering:pixelated"/>');
      }
      images.push('<g filter="url(#genglow)">'+layerImgs.join('')+'</g>');
      images.push('<g>'+layerImgs.join('')+'</g>');
    } else {
      var order = ['background','body','eyes','hoodie','neck','mouth','head'];
      for(var j=0;j<order.length;j++){
        var f2 = ts[order[j]];
        if(f2 === 'none') continue;
        var b2 = getB64(order[j], f2);
        if(b2) images.push('<image href="'+b2+'" width="24" height="24" style="image-rendering:pixelated"/>');
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="480" height="480" ' +
      'style="image-rendering:pixelated;image-rendering:crisp-edges;-webkit-image-rendering:pixelated">' +
      defs + images.join('') + '</svg>';
  }

  function svgToDataUri(svgStr){
    return 'data:image/svg+xml;base64,' + btoa(svgStr);
  }

  function renderPreview(){
    var img = document.getElementById('genPreviewImg');
    if(!img) return;
    img.src = svgToDataUri(buildSVG(currentTraits));
    updateTraitsDisplay();
  }

  function updateTraitsDisplay(){
    var friendly = function(f){
      if(f==='none') return '\u2014';
      var n = f.replace('.png','');
      if(n==='flowers_bare'||n==='flowers_with') n='Floral';
      if(n==='digital_frames') n='Digital';
      if(n==='common_bone_2') n='Prehistoric';
      if(n==='common_bone') n='Bone';
      if(n==='alienfixed') n='Alien';
      if(n==='yellow_new') n='Yellow';
      if(n==='alien_ice_prism') n='Ice Prism';
      if(n==='alien_wide_violet') n='Wide Violet';
      if(n==='Black') n='Death';
      if(n==='cozomo') n='Designer';
      if(n==='eyepatch'||n==='Alien_eyepatch') n='Eye Patch';
      n = n.replace(/_/g,' ');
      return n.charAt(0).toUpperCase() + n.slice(1);
    };
    for(var cat in traitDispIds){
      var el = document.getElementById(traitDispIds[cat]);
      if(!el) continue;
      var val = currentTraits[cat];
      var name = friendly(val);
      var r = traitRarity[cat] && traitRarity[cat][val];
      if(r && r.tier){
        el.textContent = name + '  [' + r.tier + ']';
        el.style.color = r.color;
      } else {
        el.textContent = name;
        el.style.color = '';
      }
    }
  }

  function downloadPFP(){
    var svg = buildSVG(currentTraits);
    var blob = new Blob([svg], {type:'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    var name = (currentTraits.body||'argonaut').replace('.png','');
    link.download = 'argonaut_'+name+'_'+Date.now()+'.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ─── Mode switching (within overlay) ───
  function showGeneratorMode(){
    document.getElementById('genGeneratorMode').style.display = 'grid';
    document.getElementById('genCrewMode').style.display = 'none';
    document.getElementById('genBatchMode').style.display = 'none';
  }
  function showCrewMode(){
    document.getElementById('genGeneratorMode').style.display = 'none';
    document.getElementById('genCrewMode').style.display = 'block';
    document.getElementById('genBatchMode').style.display = 'none';
    generateCrew();
  }
  function showBatchMode(){
    document.getElementById('genGeneratorMode').style.display = 'none';
    document.getElementById('genCrewMode').style.display = 'none';
    document.getElementById('genBatchMode').style.display = 'block';
    batchRender(6);
  }

  // ─── Crew + batch ───
  function generateCrew(){
    var grid = document.getElementById('genCrewGrid');
    if(!grid) return;
    grid.innerHTML = '';
    var savedTraits = Object.assign({}, currentTraits);
    for(var i=0;i<12;i++){
      var item = document.createElement('div');
      item.className = 'crew-item';
      var ts = {
        background:weightedRoll('background'), body:weightedRoll('body'),
        hoodie:weightedRoll('hoodie'), neck:weightedRoll('neck'),
        eyes:weightedRoll('eyes'), mouth:weightedRoll('mouth'), head:weightedRoll('head')
      };
      currentTraits = ts;
      applyTraitRules();
      ts = Object.assign({}, currentTraits);
      var img = document.createElement('img');
      img.src = svgToDataUri(buildSVG(ts));
      item.appendChild(img);
      item.addEventListener('click', (function(t){ return function(){
        currentTraits = t;
        showGeneratorMode();
        updateSelectors();
        renderPreview();
      }; })(ts));
      grid.appendChild(item);
    }
    currentTraits = savedTraits;
  }

  var batchEntries = [];
  function batchRender(count){
    var grid = document.getElementById('genBatchGrid');
    if(!grid) return;
    grid.innerHTML = '';
    grid.className = 'batch-grid cols-' + count;
    batchEntries = [];
    var savedTraits = Object.assign({}, currentTraits);
    document.getElementById('genBatchDownloadAll').style.display = 'none';
    for(var i=0;i<count;i++){
      var item = document.createElement('div');
      item.className = 'batch-item';
      var ts = {
        background:weightedRoll('background'), body:weightedRoll('body'),
        hoodie:weightedRoll('hoodie'), neck:weightedRoll('neck'),
        eyes:weightedRoll('eyes'), mouth:weightedRoll('mouth'), head:weightedRoll('head')
      };
      currentTraits = ts;
      applyTraitRules();
      ts = Object.assign({}, currentTraits);
      var img = document.createElement('img');
      img.src = svgToDataUri(buildSVG(ts));
      batchEntries.push({ traits:ts });
      item.appendChild(img);
      item.addEventListener('click', (function(t){ return function(){
        currentTraits = t;
        showGeneratorMode();
        updateSelectors();
        renderPreview();
      }; })(ts));
      grid.appendChild(item);
      renderedCount++;
    }
    var rc = document.getElementById('genRenderedCount');
    if(rc) rc.textContent = renderedCount;
    document.getElementById('genBatchDownloadAll').style.display = 'block';
    currentTraits = savedTraits;
  }

  function downloadAllBatch(){
    batchEntries.forEach(function(entry, i){
      var svg = buildSVG(entry.traits);
      var blob = new Blob([svg], {type:'image/svg+xml'});
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      var name = (entry.traits.body||'argonaut').replace('.png','');
      link.download = 'argonaut_batch_'+(i+1)+'_'+name+'.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // ─── Rapid mode ───
  function toggleRapid(){
    var btn = document.getElementById('genRapidBtn');
    isRapidMode = !isRapidMode;
    if(isRapidMode){
      btn.classList.add('active');
      btn.textContent = 'Stop';
      rapidInterval = setInterval(randomizeTraits, 400);
    } else {
      btn.classList.remove('active');
      btn.textContent = 'Rapid';
      clearInterval(rapidInterval);
      rapidInterval = null;
    }
  }

  // ─── Wire up buttons ───
  function wireOverlay(root){
    root.querySelectorAll('[data-act]').forEach(function(btn){
      var act = btn.dataset.act;
      btn.addEventListener('click', function(){
        switch(act){
          case 'render':       randomizeTraits(); break;
          case 'save':         downloadPFP(); break;
          case 'batch':        showBatchMode(); break;
          case 'crew':         showCrewMode(); break;
          case 'rapid':        toggleRapid(); break;
          case 'crewNew':      generateCrew(); break;
          case 'back':         showGeneratorMode(); break;
          case 'batch6':       batchRender(6); break;
          case 'batch12':      batchRender(12); break;
          case 'batch24':      batchRender(24); break;
          case 'downloadAll':  downloadAllBatch(); break;
        }
      });
    });
    root.querySelector('#genCloseBtn').addEventListener('click', closeGenerator);
    var fixedClose = root.querySelector('#genFixedCloseBtn');
    if (fixedClose) fixedClose.addEventListener('click', closeGenerator);
  }

  // ─── Lifecycle ───
  var initialized = false;
  function ensureInit(){
    if(initialized) return;
    initialized = true;
    var overlay = buildOverlayMarkup();
    document.body.appendChild(overlay);
    initVignetteCache();
    for(var tn in traits){
      if(traits.hasOwnProperty(tn)) initTraitSelector(tn, traits[tn]);
    }
    preloadAllImages();
    wireOverlay(overlay);
    randomizeTraits();
  }

  function openGenerator(){
    ensureInit();
    document.getElementById('genOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeGenerator(){
    var ov = document.getElementById('genOverlay');
    if(ov) ov.classList.remove('show');
    document.body.style.overflow = '';
    if(isRapidMode) toggleRapid();
  }

  // Keyboard: ESC closes overlay; SPACE/R re-randomizes when overlay open
  document.addEventListener('keydown', function(e){
    var ov = document.getElementById('genOverlay');
    if(!ov || !ov.classList.contains('show')) return;
    if(e.key === 'Escape'){ closeGenerator(); return; }
    if(e.key === ' ' || e.key === 'r'){
      e.preventDefault();
      randomizeTraits();
    }
  });

  // ─── Public helper: build a random valid argonaut SVG (data URI) ───
  // Used by the mint page for live hero previews. Does not touch overlay state.
  function genRandomSVG(){
    initVignetteCache();
    var saved = currentTraits;
    var ts = {
      background:weightedRoll('background'), body:weightedRoll('body'),
      hoodie:weightedRoll('hoodie'), neck:weightedRoll('neck'),
      eyes:weightedRoll('eyes'), mouth:weightedRoll('mouth'), head:weightedRoll('head')
    };
    currentTraits = ts;
    applyTraitRules();
    var out = svgToDataUri(buildSVG(currentTraits));
    currentTraits = saved;
    return out;
  }

  // Expose
  window.openGenerator  = openGenerator;
  window.closeGenerator = closeGenerator;
  window.genRandomSVG   = genRandomSVG;
})();
