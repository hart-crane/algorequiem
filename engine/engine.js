/* =====================================================================
   ALGOREQUIEM — engine
   Chrome, transitions, and interaction systems shared by every movement.
   Reads movement content from window.ALGOREQUIEM_MOVEMENTS, populated by
   the movements/*.js files loaded before this script. See
   engine-movement-contract.md for the full interface.

   This file should not need to change when adding, editing, or sealing
   / unsealing a movement — that is entirely controlled by the `status`
   field on each movement object in movements/*.js.
   ===================================================================== */
(function(){

  var MOVEMENTS = window.ALGOREQUIEM_MOVEMENTS || [];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- grain ---- */

  var grainCanvas = document.getElementById('grain');
  var gctx = grainCanvas.getContext('2d');
  var GRAIN_BASE = 160;

  function resizeGrain(){
    var ratio = window.innerHeight / window.innerWidth;
    grainCanvas.width = GRAIN_BASE;
    grainCanvas.height = Math.max(60, Math.round(GRAIN_BASE * ratio));
  }
  resizeGrain();
  window.addEventListener('resize', resizeGrain);

  function drawGrain(){
    var gw = grainCanvas.width, gh = grainCanvas.height;
    var imgData = gctx.createImageData(gw, gh);
    var d = imgData.data;
    for(var i = 0; i < d.length; i += 4){
      var v = Math.random() * 255;
      d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 255;
    }
    gctx.putImageData(imgData, 0, 0);
  }
  drawGrain();
  if(!reduceMotion){ setInterval(drawGrain, 90); }

  /* ---- bg-code text grain (background-clip: text) ---- */
  var bgGrainCanvas = document.createElement('canvas');
  bgGrainCanvas.width  = 64;
  bgGrainCanvas.height = 64;
  var bgGrainCtx = bgGrainCanvas.getContext('2d');

  function drawBgGrain(){
    var bgEl = document.getElementById('bg-code');
    if(!bgEl) return;
    var imgData = bgGrainCtx.createImageData(64, 64);
    var d = imgData.data;
    for(var i = 0; i < d.length; i += 4){
      var v = Math.random() * 255;
      d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 255;
    }
    bgGrainCtx.putImageData(imgData, 0, 0);
    bgEl.style.backgroundImage = 'url(' + bgGrainCanvas.toDataURL() + ')';
  }

  drawBgGrain(); /* set initial texture before first interval */
  if(!reduceMotion){ setInterval(drawBgGrain, 90); }

  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  function typeLine(lineEl, text, speed){
    return new Promise(function(resolve){
      var textSpan = lineEl.querySelector('.lineText');
      var caret = document.createElement('span');
      caret.className = 'caret';
      caret.textContent = '▌';
      lineEl.appendChild(caret);
      if(reduceMotion){
        textSpan.textContent = text;
        caret.remove();
        resolve();
        return;
      }
      var i = 0;
      var iv = setInterval(function(){
        i++;
        textSpan.textContent = text.slice(0, i);
        if(i >= text.length){
          clearInterval(iv);
          caret.remove();
          resolve();
        }
      }, speed);
    });
  }

  function decode(el, target, dur, charset){
    charset = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆ';
    return new Promise(function(resolve){
      if(reduceMotion){ el.textContent = target; resolve(); return; }
      var len = target.length;
      var totalFrames = Math.max(8, Math.round(dur / 28));
      var frameN = 0;
      var iv = setInterval(function(){
        frameN++;
        var reveal = Math.floor((frameN / totalFrames) * len);
        var out = '';
        for(var i = 0; i < len; i++){
          out += (i < reveal || target[i] === ' ')
            ? target[i]
            : charset[Math.floor(Math.random() * charset.length)];
        }
        el.textContent = out;
        if(frameN >= totalFrames){ el.textContent = target; clearInterval(iv); resolve(); }
      }, 28);
    });
  }

  var DIGITS = '0123456789';

  /* ---- landing intro sequence ---- */

  async function runIntro(){
    var rule = '===================================';
    await typeLine(document.getElementById('l-rule1'), '✤ ' + rule, 9);
    await typeLine(document.getElementById('l-title'), '✤ ALGOREQUIEM', 15);

    var titleSpan = document.querySelector('#l-title .lineText');
    titleSpan.innerHTML = '✤ <span class="illum">A</span><span class="title-word">LGOREQUIEM</span>';

    await wait(120);
    await typeLine(document.getElementById('l-meta'), '✤ Arch: x46-23 | Assembler: GNUmass', 11);
    await typeLine(document.getElementById('l-rule2'), '✤ ' + rule, 9);
    await wait(260);
    await typeLine(document.getElementById('l-data'), '.section .data', 16);
    await wait(180);

    var rows = document.querySelectorAll('.row');
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      row.classList.add('visible');
      var titleEl = row.querySelector('.title-text');
      await decode(titleEl, titleEl.getAttribute('data-final'), row.classList.contains('live') ? 520 : 360);
      await wait(55);
    }

    await wait(280);
    await typeLine(document.getElementById('btnText'), '.section .text', 16);
    attachTumble(document.getElementById('btnText'));
    await wait(160);
    await typeLine(document.getElementById('btnStart'), '.globl _start', 16);
    attachTumble(document.getElementById('btnStart'));

    document.body.classList.add('ready');
  }

  function attachTumble(buttonEl){
    var span = buttonEl.querySelector('.lineText');
    var final = span.textContent;
    var tumble = function(){ decode(span, final, 320, DIGITS); };
    buttonEl.addEventListener('mouseenter', tumble);
    buttonEl.addEventListener('focus', tumble);
  }

  /* ---- contents list — built from MOVEMENTS, in registration order ---- */

  function buildContentsRows(){
    var nav = document.getElementById('contents');
    MOVEMENTS.forEach(function(m){
      var isLive = m.status === 'live';

      var row = document.createElement('div');
      row.className = 'row' + (isLive ? ' live' : '');
      row.setAttribute('data-final', m.title);

      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = m.number;
      row.appendChild(num);

      var titleText = document.createElement('span');
      titleText.className = 'title-text';
      titleText.setAttribute('data-final', m.title);

      if(isLive){
        var a = document.createElement('a');
        a.className = 'title-live';
        a.href = '#' + m.slug;
        a.appendChild(titleText);
        a.addEventListener('mouseenter', function(){ decode(titleText, m.title, 360, DIGITS); });
        a.addEventListener('focus',      function(){ decode(titleText, m.title, 360, DIGITS); });
        a.addEventListener('click', function(e){ e.preventDefault(); enterReading(m); });
        row.appendChild(a);
      } else {
        var span = document.createElement('span');
        span.className = 'title-sealed';
        span.appendChild(titleText);
        var tag = document.createElement('span');
        tag.className = 'sealed-tag';
        tag.setAttribute('aria-hidden', 'true');
        tag.textContent = '· sealed';
        span.appendChild(tag);
        var sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = '— not yet available';
        span.appendChild(sr);
        row.appendChild(span);
      }

      nav.appendChild(row);
    });
  }

  /* ---- poem streaming ---- */

  var poemStarted = false;
  var currentMovementId = null;
  var currentNextLabel  = null;

  function resetPoem(){
    var lines = document.querySelectorAll('.poem-line');
    for(var i = 0; i < lines.length; i++){
      var el = lines[i];
      while(el.firstChild){ el.removeChild(el.firstChild); }
      el.classList.remove('in');
    }
  }

  /* ---- dynamic poem page rendering (standard-type movements) ---- */

  var poemPagesEl = document.getElementById('poem-pages');
  var ORDINALS = ['zeroth','first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];

  function clearPoemPages(){
    while(poemPagesEl.firstChild){ poemPagesEl.removeChild(poemPagesEl.firstChild); }
  }

  /* Builds .poem-page elements from movement.pages. Page 0 is left empty
     with a data-line attribute for runPoem()'s typewriter effect; every
     later page is rendered with its final text immediately (class 'in'),
     matching the original Androït build. Returns the ordered list of
     page element ids. */
  function renderPoemPages(movement){
    clearPoemPages();
    var ids = [];
    movement.pages.forEach(function(page, idx){
      var pageId = 'poem-page-' + (idx + 1);
      ids.push(pageId);

      var pageEl = document.createElement(idx === 0 ? 'main' : 'section');
      pageEl.className = 'poem-page';
      pageEl.id = pageId;

      var wrap = document.createElement('div');
      wrap.className = 'poem-wrap';

      var ol = document.createElement('ol');
      ol.className = 'poem';
      ol.setAttribute('aria-label', movement.title + ', ' + (ORDINALS[idx + 1] || (idx + 1) + 'th') + ' page');

      page.lines.forEach(function(lineText){
        var li = document.createElement('li');
        if(idx === 0){
          li.className = 'poem-line';
          li.setAttribute('data-line', lineText);
        } else {
          li.className = 'poem-line in';
          li.textContent = lineText;
        }
        ol.appendChild(li);
      });

      wrap.appendChild(ol);
      pageEl.appendChild(wrap);
      poemPagesEl.appendChild(pageEl);
    });
    return ids;
  }

  /* ---- call line state ---- */

  var callLineShown = false;

  function checkCallLineState(){
    if(!document.body.classList.contains('reading')) return;
    if(!currentNextLabel) return;
    if(!POEM_PAGE_IDS.length) return;
    var show = getCurrentPageIndex() === POEM_PAGE_IDS.length - 1;
    if(show && !callLineShown){
      callLineShown = true;
      if(isTouchPrimary) _showMobileCallLine();
      else showDesktopCallLine();
    } else if(!show && callLineShown){
      callLineShown = false;
      if(isTouchPrimary) _hideMobileCallLine();
      else hideDesktopCallLine();
    }
  }

  function resetCallLine(){
    callLineShown = false;
    if(isTouchPrimary) _resetMobileCallLine();
    else resetDesktopCallLine();
  }

  function lpStream(el, text){
    if(el._lpIv){ clearInterval(el._lpIv); }
    el.textContent = '';
    if(reduceMotion){ lpStructureCallLine(el); return; }
    var caret = document.createElement('span');
    caret.className = 'stream-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);
    var i = 0;
    el._lpIv = setInterval(function(){
      i++;
      el.insertBefore(document.createTextNode(text[i-1]), caret);
      if(i >= text.length){
        clearInterval(el._lpIv);
        el._lpIv = null;
        /* restructure into interactive span + persistent blinking caret */
        lpStructureCallLine(el);
      }
    }, 30);
  }

  function lpStructureCallLine(el){
    el.textContent = '';
    el.appendChild(document.createTextNode('call   '));
    var link = document.createElement('span');
    link.className = 'lp-calllink';
    link.setAttribute('data-term', currentNextLabel);
    link.textContent = currentNextLabel;
    el.appendChild(link);
    el.appendChild(document.createTextNode(' '));
    var caret = document.createElement('span');
    caret.className = 'stream-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);
    attachCallLinkHover(link);
  }

  function attachCallLinkHover(span){
    span.addEventListener('mouseenter', function(){
      startTermTumble(span);
    });
    span.addEventListener('mouseleave', function(){
      cancelTermTumble();
      span.textContent = currentNextLabel;
    });
  }

  /* collect visible text from el, skipping the stream-caret span */
  function getVisibleText(el){
    var text = '';
    for(var i = 0; i < el.childNodes.length; i++){
      var node = el.childNodes[i];
      if(node.nodeType === Node.TEXT_NODE){
        text += node.textContent;
      } else if(node.nodeType === Node.ELEMENT_NODE &&
                node.className.indexOf('stream-caret') === -1){
        text += node.textContent;
      }
    }
    return text;
  }

  /* reverse-stream: delete characters right-to-left then call onDone */
  function lpUnstream(el, onDone){
    if(el._lpIv){ clearInterval(el._lpIv); el._lpIv = null; }
    var text = getVisibleText(el);
    el.textContent = text; /* flatten — removes caret and child spans */
    if(reduceMotion || text.length === 0){ if(onDone) onDone(); return; }
    var len = text.length;
    el._lpIv = setInterval(function(){
      len--;
      el.textContent = len > 0 ? text.slice(0, len) : '';
      if(len <= 0){
        clearInterval(el._lpIv);
        el._lpIv = null;
        if(onDone) onDone();
      }
    }, 30);
  }

  /* ---- call line state — shared between desktop and mobile ---- */

  var mobileCallLineActive  = false;
  var _showMobileCallLine   = function(){};
  var _hideMobileCallLine   = function(){};
  var _resetMobileCallLine  = function(){};

  /* stream without restructuring into lp-calllink — used on mobile */
  function lpStreamSimple(el, text){
    if(!el) return;
    if(el._lpIv){ clearInterval(el._lpIv); }
    el.textContent = '';
    if(reduceMotion){ el.textContent = text; return; }
    var caret = document.createElement('span');
    caret.className = 'stream-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);
    var i = 0;
    el._lpIv = setInterval(function(){
      i++;
      el.insertBefore(document.createTextNode(text[i-1]), caret);
      if(i >= text.length){
        clearInterval(el._lpIv);
        el._lpIv = null;
        /* space before caret, matching lpStructureCallLine behaviour */
        el.insertBefore(document.createTextNode(' '), caret);
      }
    }, 30);
  }

  /* desktop call line functions */
  function showDesktopCallLine(){
    var wrap = document.getElementById('call-line-desktop');
    var line = document.getElementById('lp-8-desktop');
    if(!wrap || !line) return;
    wrap.classList.add('call-visible');
    wrap.setAttribute('aria-hidden', 'false');
    lpStream(line, 'call   ' + currentNextLabel);
  }

  function hideDesktopCallLine(){
    var wrap = document.getElementById('call-line-desktop');
    var line = document.getElementById('lp-8-desktop');
    if(!wrap || !line) return;
    lpUnstream(line, function(){
      wrap.classList.remove('call-visible');
      wrap.setAttribute('aria-hidden', 'true');
    });
  }

  function resetDesktopCallLine(){
    var wrap = document.getElementById('call-line-desktop');
    var line = document.getElementById('lp-8-desktop');
    if(line && line._lpIv){ clearInterval(line._lpIv); line._lpIv = null; }
    if(line){ while(line.firstChild) line.removeChild(line.firstChild); }
    if(wrap){ wrap.classList.remove('call-visible'); wrap.setAttribute('aria-hidden', 'true'); }
  }

  function streamLine(lineEl, text){
    return new Promise(function(resolve){
      lineEl.classList.add('in');
      if(reduceMotion){ lineEl.textContent = text; resolve(); return; }
      var caret = document.createElement('span');
      caret.className = 'stream-caret';
      caret.setAttribute('aria-hidden', 'true');
      lineEl.appendChild(caret);
      var i = 0;
      var speed = text.length > 42 ? 8 : 10;
      var iv = setInterval(function(){
        i++;
        lineEl.insertBefore(document.createTextNode(text[i-1]), caret);
        if(i >= text.length){ clearInterval(iv); caret.remove(); resolve(); }
      }, speed);
    });
  }

  /* ---- exegesis data — swapped in per movement by loadMovementTerms() ---- */

  var EXEGESIS     = {};
  var INDEX        = {};
  var TERMS        = [];
  var TERM_PATTERN = null;

  function loadMovementTerms(movement){
    EXEGESIS = movement.terms    || {};
    INDEX    = movement.index    || {};
    TERMS    = movement.termList || [];
    TERM_PATTERN = TERMS.length ? new RegExp(
      '(' + TERMS.map(function(t){
        return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }).join('|') + ')',
      'g'
    ) : null;
  }

  var isTouchPrimary = window.matchMedia('(pointer: coarse) and (hover: none)').matches;

  /* ---- term tumble — shared between desktop and mobile attach functions ---- */

  var termTumbleIv   = null;
  var termTumbleSpan = null;

  function startTermTumble(span){
    if(reduceMotion) return;
    if(termTumbleIv){ clearInterval(termTumbleIv); termTumbleIv = null; }
    var finalText   = span.getAttribute('data-term');
    var len         = finalText.length;
    var totalFrames = Math.max(8, Math.round(280 / 28));
    var frameN      = 0;
    termTumbleSpan  = span;
    termTumbleIv    = setInterval(function(){
      frameN++;
      var reveal = Math.floor((frameN / totalFrames) * len);
      var out = '';
      for(var i = 0; i < len; i++){
        out += (i < reveal || finalText[i] === ' ')
          ? finalText[i]
          : DIGITS[Math.floor(Math.random() * DIGITS.length)];
      }
      span.textContent = out;
      if(frameN >= totalFrames){
        span.textContent = finalText;
        clearInterval(termTumbleIv);
        termTumbleIv   = null;
        termTumbleSpan = null;
      }
    }, 28);
  }

  function cancelTermTumble(){
    if(termTumbleIv){
      clearInterval(termTumbleIv);
      termTumbleIv = null;
      if(termTumbleSpan){
        termTumbleSpan.textContent = termTumbleSpan.getAttribute('data-term');
        termTumbleSpan = null;
      }
    }
  }

  function wrapTerms(){
    if(!TERM_PATTERN) return;
    var lines = document.querySelectorAll('.poem-line');
    for(var i = 0; i < lines.length; i++){
      var text = lines[i].textContent;
      if(TERM_PATTERN.test(text)){
        TERM_PATTERN.lastIndex = 0;
        lines[i].innerHTML = text.replace(
          TERM_PATTERN,
          '<span class="term" data-term="$1">$1</span>'
        );
      }
    }
    if(isTouchPrimary) attachTermHoversMobile();
    else               attachTermHovers();
  }
  function attachTermHovers(){
    var panel      = document.getElementById('exegesis');
    var textEl     = document.getElementById('exegesis-text');
    var eyebrowEl  = document.getElementById('exegesis-eyebrow');
    var hideTimer   = null;
    var pinnedTerm  = null;
    var flipToken   = null;
    var currentText  = '';
    var currentIndex = '';

    /* ---- flip board IN ---- */
    function flipIn(text, indexText){
      if(flipToken) flipToken.cancelled = true;
      if(reduceMotion){
        eyebrowEl.textContent = indexText;
        textEl.textContent = text;
        return;
      }

      var token = { cancelled: false };
      flipToken = token;
      var t0 = null;

      var len = text.length;
      var settleAt = new Array(len);
      for(var i = 0; i < len; i++){
        settleAt[i] = (text[i] === ' ') ? 0 : 30 + Math.random() * 200;
      }

      var eyeLen = indexText.length;
      var eyeSettleAt = new Array(eyeLen);
      for(var i = 0; i < eyeLen; i++){
        /* dots are structural anchors — keep them visible throughout */
        eyeSettleAt[i] = (indexText[i] === '.') ? 0 : 30 + Math.random() * 200;
      }

      function frame(ts){
        if(token.cancelled) return;
        if(!t0) t0 = ts;
        var elapsed = ts - t0;

        var out = '', pending = false;
        for(var i = 0; i < len; i++){
          if(text[i] === ' ' || elapsed >= settleAt[i]){
            out += text[i];
          } else {
            out += DIGITS[Math.floor(Math.random() * DIGITS.length)];
            pending = true;
          }
        }
        textEl.textContent = out;

        var eyeOut = '', eyePending = false;
        for(var i = 0; i < eyeLen; i++){
          if(indexText[i] === '.' || elapsed >= eyeSettleAt[i]){
            eyeOut += indexText[i];
          } else {
            eyeOut += DIGITS[Math.floor(Math.random() * DIGITS.length)];
            eyePending = true;
          }
        }
        eyebrowEl.textContent = eyeOut;

        if(pending || eyePending) requestAnimationFrame(frame);
        else{
          textEl.textContent = text;
          eyebrowEl.textContent = indexText;
        }
      }
      requestAnimationFrame(frame);
    }

    /* ---- flip board OUT ---- */
    function flipOut(text, indexText, onDone){
      if(flipToken) flipToken.cancelled = true;
      if(reduceMotion){ onDone(); return; }

      var token = { cancelled: false };
      flipToken = token;
      var t0 = null;

      var len = text.length;
      var scrambleAt = new Array(len);
      for(var i = 0; i < len; i++){
        scrambleAt[i] = (text[i] === ' ') ? 0 : Math.random() * 100;
      }

      var eyeLen = indexText.length;
      var eyeScrambleAt = new Array(eyeLen);
      for(var i = 0; i < eyeLen; i++){
        eyeScrambleAt[i] = (indexText[i] === '.') ? 0 : Math.random() * 100;
      }

      function frame(ts){
        if(token.cancelled) return;
        if(!t0) t0 = ts;
        var elapsed = ts - t0;

        var out = '', pending = false;
        for(var i = 0; i < len; i++){
          if(text[i] === ' ' || elapsed < scrambleAt[i]){
            out += text[i];
            if(text[i] !== ' ' && elapsed < scrambleAt[i]) pending = true;
          } else {
            out += DIGITS[Math.floor(Math.random() * DIGITS.length)];
          }
        }
        textEl.textContent = out;

        var eyeOut = '', eyePending = false;
        for(var i = 0; i < eyeLen; i++){
          if(indexText[i] === '.' || elapsed < eyeScrambleAt[i]){
            eyeOut += indexText[i];
            if(indexText[i] !== '.' && elapsed < eyeScrambleAt[i]) eyePending = true;
          } else {
            eyeOut += DIGITS[Math.floor(Math.random() * DIGITS.length)];
          }
        }
        eyebrowEl.textContent = eyeOut;

        if(pending || eyePending) requestAnimationFrame(frame);
        else onDone();
      }
      requestAnimationFrame(frame);
    }

    function showFor(key){
      var content = EXEGESIS[key];
      if(!content) return;
      clearTimeout(hideTimer);
      currentText  = content;
      currentIndex = INDEX[key] || '';
      panel.classList.add('visible');
      flipIn(content, currentIndex);
    }

    function scheduleHide(){
      if(pinnedTerm) return;
      hideTimer = setTimeout(function(){
        var snap      = currentText;
        var snapIndex = currentIndex;
        flipOut(snap, snapIndex, function(){
          panel.classList.remove('visible');
        });
      }, 60);
    }

    panel.addEventListener('mouseenter', function(){
      clearTimeout(hideTimer);
      if(flipToken) flipToken.cancelled = true;
      cancelTermTumble();
    });
    panel.addEventListener('mouseleave', scheduleHide);

    document.querySelectorAll('.term').forEach(function(span){
      span.addEventListener('mouseenter', function(){
        if(pinnedTerm) return;
        startTermTumble(span);
        showFor(span.getAttribute('data-term'));
      });

      span.addEventListener('mouseleave', function(){
        if(pinnedTerm) return;
        cancelTermTumble();
        scheduleHide();
      });

      span.addEventListener('click', function(){
        if(pinnedTerm === span){
          span.classList.remove('pinned');
          pinnedTerm = null;
          document.body.classList.remove('term-pinned');
        } else if(pinnedTerm){
          return;
        } else {
          pinnedTerm = span;
          span.classList.add('pinned');
          document.body.classList.add('term-pinned');
          /* show content directly on click — no flip animation */
          var content = EXEGESIS[span.getAttribute('data-term')];
          if(content){
            if(flipToken) flipToken.cancelled = true;
            currentText  = content;
            currentIndex = INDEX[span.getAttribute('data-term')] || '';
            textEl.textContent    = content;
            eyebrowEl.textContent = currentIndex;
            panel.classList.add('visible');
          }
        }
      });
    });
  }

  function attachTermHoversMobile(){
    var sheet       = document.getElementById('exegesis-sheet');
    var eyebrow     = document.getElementById('sheet-eyebrow');
    var textEl      = document.getElementById('sheet-text');
    var closeBtn    = document.getElementById('exegesis-sheet-close');
    var callSection = document.getElementById('sheet-call-section');
    var callLine    = document.getElementById('lp-8-mobile');
    var activeTerm  = null;

    /* helper: animate the sheet's height around a content change */
    function animateSheetHeight(callback){
      var currentH = sheet.offsetHeight;
      sheet.style.height = currentH + 'px';
      callback();
      sheet.style.height = 'auto';
      var targetH = sheet.offsetHeight;
      sheet.style.height = currentH + 'px';
      sheet.offsetHeight; /* force reflow */
      sheet.style.transition = 'transform 0.35s ease, height 0.3s ease';
      sheet.style.height = targetH + 'px';
      var cleanup = function(e){
        if(e.propertyName !== 'height') return;
        sheet.style.height = '';
        sheet.style.transition = '';
        sheet.removeEventListener('transitionend', cleanup);
      };
      sheet.addEventListener('transitionend', cleanup);
    }

    /* show or hide the term chrome (eyebrow, text, close button) */
    function setTermChrome(visible){
      eyebrow.style.display  = visible ? 'block' : 'none';
      textEl.style.display   = visible ? 'block' : 'none';
      closeBtn.style.display = visible ? 'flex'  : 'none';
    }

    function openSheet(key, span){
      var content = EXEGESIS[key];
      var idx     = INDEX[key] || '';
      if(!content) return;

      /* switch pinned term */
      if(activeTerm && activeTerm !== span){
        activeTerm.classList.remove('pinned');
      }
      activeTerm = span;
      span.classList.add('pinned');
      document.body.classList.add('term-pinned');
      startTermTumble(span);

      if(sheet.classList.contains('open')){
        /* already open (call line or previous term) — animate height swap */
        animateSheetHeight(function(){
          setTermChrome(true);
          eyebrow.textContent = idx;
          textEl.textContent  = content;
        });
      } else {
        setTermChrome(true);
        eyebrow.textContent = idx;
        textEl.textContent  = content;
        sheet.classList.add('open');
        sheet.setAttribute('aria-hidden', 'false');
      }
    }

    function closeSheet(){
      /* if only call line showing (no term), do nothing — only scroll closes it */
      if(!activeTerm && mobileCallLineActive) return;

      /* clear any in-progress height animation to avoid conflicts with the slide */
      sheet.style.height = '';
      sheet.style.transition = '';

      if(activeTerm){
        var closing = activeTerm;
        activeTerm = null;
        closing.classList.remove('pinned');
        startTermTumble(closing);
      }
      document.body.classList.remove('term-pinned');

      if(mobileCallLineActive){
        /* call line still active — keep sheet open, fade out term chrome then shrink height */
        sheet.classList.add('closing');
        var onRotate1 = function(e){
          if(e.propertyName !== 'transform') return;
          closeBtn.removeEventListener('transitionend', onRotate1);
          sheet.classList.remove('closing');

          /* pin height before fading so we can measure the target */
          var pinnedH = sheet.offsetHeight;
          sheet.style.height = pinnedH + 'px';

          /* fade out term content */
          eyebrow.style.transition = 'opacity 0.2s ease';
          textEl.style.transition   = 'opacity 0.2s ease';
          eyebrow.style.opacity = '0';
          textEl.style.opacity  = '0';

          setTimeout(function(){
            setTermChrome(false);
            eyebrow.style.transition = '';
            textEl.style.transition   = '';
            eyebrow.style.opacity = '';
            textEl.style.opacity  = '';

            /* animate height down to call-line-only height */
            sheet.style.height = 'auto';
            var targetH = sheet.offsetHeight;
            sheet.style.height = pinnedH + 'px';
            sheet.offsetHeight; /* reflow */
            sheet.style.transition = 'transform 0.35s ease, height 0.3s ease';
            sheet.style.height = targetH + 'px';
            var cleanup = function(e2){
              if(e2.propertyName !== 'height') return;
              sheet.style.height = '';
              sheet.style.transition = '';
              sheet.removeEventListener('transitionend', cleanup);
            };
            sheet.addEventListener('transitionend', cleanup);
          }, 220);
        };
        closeBtn.addEventListener('transitionend', onRotate1);
      } else {
        /* no call line — slide sheet down; clean up content after slide completes */
        sheet.classList.add('closing');
        var onRotate2 = function(e){
          if(e.propertyName !== 'transform') return;
          closeBtn.removeEventListener('transitionend', onRotate2);
          sheet.classList.remove('closing');
          /* defer to next frame so the browser starts a fresh transition
             rather than jumping within the current transitionend cycle */
          requestAnimationFrame(function(){
            sheet.classList.remove('open');
            sheet.setAttribute('aria-hidden', 'true');
            var onSlide = function(e2){
              if(e2.propertyName !== 'transform') return;
              sheet.removeEventListener('transitionend', onSlide);
              setTermChrome(false);
            };
            sheet.addEventListener('transitionend', onSlide);
          });
        };
        closeBtn.addEventListener('transitionend', onRotate2);
      }
    }

    closeBtn.addEventListener('click', function(e){
      e.stopPropagation();
      closeSheet();
    });

    document.addEventListener('click', function(e){
      if(sheet.classList.contains('open') && !sheet.contains(e.target)){
        closeSheet();
      }
    });

    document.querySelectorAll('.term').forEach(function(span){
      span.addEventListener('click', function(e){
        e.stopPropagation();
        var key = span.getAttribute('data-term');
        if(activeTerm === span) closeSheet();
        else openSheet(key, span);
      });
    });

    /* ---- mobile call line functions (exposed to state machine) ---- */

    _showMobileCallLine = function(){
      mobileCallLineActive = true;
      animateSheetHeight(function(){
        callSection.classList.add('call-active');
      });
      if(!sheet.classList.contains('open')){
        setTermChrome(false);
        sheet.classList.add('open');
        sheet.setAttribute('aria-hidden', 'false');
      }
      lpStreamSimple(callLine, 'call   ' + currentNextLabel);
    };

    _hideMobileCallLine = function(){
      mobileCallLineActive = false;
      lpUnstream(callLine, function(){
        animateSheetHeight(function(){
          callSection.classList.remove('call-active');
        });
        if(!activeTerm){
          /* no term active — close the sheet */
          sheet.classList.remove('open');
          sheet.setAttribute('aria-hidden', 'true');
        }
      });
    };

    _resetMobileCallLine = function(){
      mobileCallLineActive = false;
      if(callLine && callLine._lpIv){ clearInterval(callLine._lpIv); callLine._lpIv = null; }
      if(callLine){ while(callLine.firstChild) callLine.removeChild(callLine.firstChild); }
      callSection.classList.remove('call-active');
      setTermChrome(false);
      if(activeTerm){ activeTerm.classList.remove('pinned'); activeTerm = null; }
      document.body.classList.remove('term-pinned');
      sheet.classList.remove('open', 'closing');
      sheet.setAttribute('aria-hidden', 'true');
    };
  }

  async function runPoem(){
    var lines = document.querySelectorAll('#poem-page-1 .poem-line');
    for(var i = 0; i < lines.length; i++){
      var el = lines[i];
      var text = el.getAttribute('data-line');
      await streamLine(el, text);
      await wait(/[.:\-]$/.test(text.trim()) ? 100 : 40);
    }
    wrapTerms();
    checkCallLineState();
  }

  /* ---- background code panel — state per page, swapped per movement ---- */

  var bgCodeEl    = document.getElementById('bg-code');
  var BG_FULL     = [];
  var bgCodeState = 0;

  function renderInitialBgCode(){
    if(!bgCodeEl) return;
    bgCodeEl.textContent = '';
    bgCodeState = 0;
    BG_FULL.forEach(function(){}); /* no-op guard kept for symmetry */
    if(!BG_FULL.length) return;
    BG_FULL[0].forEach(function(line, i){
      var span = document.createElement('span');
      span.id = 'bgc-' + i;
      span.textContent = line;
      bgCodeEl.appendChild(span);
    });
  }

  function tumbleBgLine(el, text){
    if(!el) return;
    if(el._bgIv){ clearInterval(el._bgIv); }
    if(reduceMotion){ el.textContent = text; return; }
    var len = text.length;
    var totalFrames = Math.max(8, Math.round(280 / 28));
    var frameN = 0;
    el._bgIv = setInterval(function(){
      frameN++;
      var reveal = Math.floor((frameN / totalFrames) * len);
      var out = '';
      for(var i = 0; i < len; i++){
        out += (i < reveal || text[i] === ' ')
          ? text[i]
          : DIGITS[Math.floor(Math.random() * DIGITS.length)];
      }
      el.textContent = out;
      if(frameN >= totalFrames){
        el.textContent = text;
        clearInterval(el._bgIv);
        el._bgIv = null;
      }
    }, 28);
  }

  function updateBgCodeState(){
    if(!document.body.classList.contains('reading')) return;
    if(!BG_FULL.length || !POEM_PAGE_IDS.length) return;
    var newState = Math.min(getCurrentPageIndex(), BG_FULL.length - 1);
    if(newState === bgCodeState) return;
    var oldLines = BG_FULL[bgCodeState];
    var newLines = BG_FULL[newState];
    bgCodeState = newState;
    for(var i = 0; i < newLines.length; i++){
      if(newLines[i] !== oldLines[i]){
        tumbleBgLine(document.getElementById('bgc-' + i), newLines[i]);
      }
    }
  }

  function resetBgCode(){
    bgCodeState = 0;
    if(!BG_FULL.length) return;
    BG_FULL[0].forEach(function(line, i){
      var span = document.getElementById('bgc-' + i);
      if(!span) return;
      if(span._bgIv){ clearInterval(span._bgIv); span._bgIv = null; }
      span.textContent = line;
    });
  }

  function updateBgCodeSize(){
    if(!bgCodeEl) return;
    var rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var padPx  = 2.5 * rootPx;
    var lineCount = (BG_FULL[0] && BG_FULL[0].length) || 9;
    bgCodeEl.style.fontSize = Math.floor((window.innerHeight - 2 * padPx) / (lineCount * 1.3)) + 'px';
  }

  /* ---- poem page keyboard/scroll navigation — dynamic per movement ---- */

  var POEM_PAGE_IDS = [];

  function getCurrentPageIndex(){
    var mid = window.scrollY + window.innerHeight / 2;
    for(var i = POEM_PAGE_IDS.length - 1; i >= 0; i--){
      var el = document.getElementById(POEM_PAGE_IDS[i]);
      if(el && el.offsetTop <= mid) return i;
    }
    return 0;
  }

  function scrollToPage(index){
    if(index < 0 || index >= POEM_PAGE_IDS.length) return;
    var el = document.getElementById(POEM_PAGE_IDS[index]);
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- view transitions ---- */

  var readingEl  = document.getElementById('reading');
  var landingEl  = document.getElementById('landing');

  function tumbleHeading(movement){
    var h2 = document.querySelector('.poem-section-heading');
    if(!h2) return;
    var prefix = movement.heading.prefix;
    var title  = movement.heading.title;
    var target = prefix + title;
    var len    = target.length;
    if(reduceMotion){
      h2.innerHTML = '<span class="lp-heading-accent">' + prefix + '</span>' + title;
      return;
    }
    var totalFrames = Math.max(8, Math.round(480 / 28));
    var frameN = 0;
    var iv = setInterval(function(){
      frameN++;
      var reveal = Math.floor((frameN / totalFrames) * len);
      var out = '';
      for(var i = 0; i < len; i++){
        out += i < reveal
          ? target[i]
          : DIGITS[Math.floor(Math.random() * DIGITS.length)];
      }
      h2.textContent = out;
      if(frameN >= totalFrames){
        clearInterval(iv);
        h2.innerHTML = '<span class="lp-heading-accent">' + prefix + '</span>' + title;
      }
    }, 28);
  }

  /* loads a movement's content into the reading view. Only runs the
     (potentially expensive) rebuild when switching to a *different*
     movement than the one currently loaded. */
  function loadMovementForReading(movement){
    currentMovementId = movement.id;
    loadMovementTerms(movement);
    currentNextLabel = movement.nextLabel || null;

    if(movement.type === 'custom' && typeof movement.render === 'function'){
      clearPoemPages();
      movement.render(poemPagesEl);
      POEM_PAGE_IDS = Array.prototype.map.call(
        poemPagesEl.querySelectorAll('.poem-page'),
        function(el){ return el.id; }
      );
    } else {
      POEM_PAGE_IDS = renderPoemPages(movement);
    }

    BG_FULL = (movement.bgCode && movement.bgCode.states) || [];
    renderInitialBgCode();
    updateBgCodeSize();
    poemStarted = false;
  }

  function enterReading(movement){
    if(!movement) return;
    if(document.body.classList.contains('entering')) return;
    document.body.classList.add('entering');
    /* clear heading so tumble always starts from empty */
    var h2 = document.querySelector('.poem-section-heading');
    if(h2) h2.textContent = '';
    setTimeout(function(){
      document.body.classList.add('reading');
      readingEl.removeAttribute('aria-hidden');

      if(currentMovementId !== movement.id){
        loadMovementForReading(movement);
      }

      if(!poemStarted){
        poemStarted = true;
        setTimeout(runPoem, reduceMotion ? 0 : 400);
        /* checkCallLineState called at end of runPoem */
      } else {
        setTimeout(function(){ checkCallLineState(); updateBgCodeState(); }, reduceMotion ? 0 : 300);
      }
      /* tumble heading during the reading view fade-in */
      setTimeout(function(){ tumbleHeading(movement); }, reduceMotion ? 0 : 350);
    }, reduceMotion ? 0 : 600);
  }

  /* ---- waitlist modal — shown from #btnStart while no movement is
     live yet. Purely chrome: not tied to any movement's content. ---- */

  var waitlistOpen = false;
  var waitlistReturnFocus = null;

  function openWaitlistModal(){
    if(waitlistOpen) return;
    waitlistOpen = true;
    waitlistReturnFocus = document.activeElement;

    var backdrop = document.getElementById('waitlistBackdrop');
    var modal    = document.getElementById('waitlistModal');
    var heading  = document.querySelector('#waitlistHeading .lineText');

    backdrop.hidden = false;
    modal.hidden = false;
    heading.textContent = '';
    /* force layout before adding the transition-triggering class */
    void modal.offsetWidth;
    requestAnimationFrame(function(){
      backdrop.classList.add('visible');
      modal.classList.add('visible');
    });
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    decode(heading, 'Cursor is waiting', 900, DIGITS);

    var closeBtn = document.getElementById('waitlistClose');
    closeBtn.focus();
  }

  function closeWaitlistModal(){
    if(!waitlistOpen) return;
    waitlistOpen = false;

    var modal    = document.getElementById('waitlistModal');
    var closeBtn = document.getElementById('waitlistClose');

    if(reduceMotion){
      finishCloseWaitlistModal();
      return;
    }

    /* rotate the close glyph back to 0° first, then fade/scale out */
    modal.classList.add('closing');
    var onRotate = function(e){
      if(e.propertyName !== 'transform') return;
      closeBtn.removeEventListener('transitionend', onRotate);
      modal.classList.remove('closing');
      finishCloseWaitlistModal();
    };
    closeBtn.addEventListener('transitionend', onRotate);
  }

  function finishCloseWaitlistModal(){
    var backdrop = document.getElementById('waitlistBackdrop');
    var modal    = document.getElementById('waitlistModal');

    backdrop.classList.remove('visible');
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    setTimeout(function(){
      backdrop.hidden = true;
      modal.hidden = true;
    }, reduceMotion ? 0 : 300);

    if(waitlistReturnFocus && typeof waitlistReturnFocus.focus === 'function'){
      waitlistReturnFocus.focus();
    }
    waitlistReturnFocus = null;
  }

  function exitReading(){
    readingEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reading');
    resetCallLine();
    resetBgCode();
    setTimeout(function(){
      document.body.classList.remove('entering');
    }, reduceMotion ? 0 : 900);
  }

  /* ---- init ---- */

  window.addEventListener('DOMContentLoaded', function(){
    buildContentsRows(); /* must run before runIntro, which decodes each row */

    requestAnimationFrame(function(){ document.body.classList.add('bg-in'); });
    setTimeout(runIntro, reduceMotion ? 0 : 850);

    var colophon = document.getElementById('colophon');
    document.getElementById('btnText').addEventListener('click', function(){
      var open = colophon.classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* "begin reading" opens the first live movement, in sequence order —
       while none are live yet, it opens the waitlist modal instead. This
       falls back to enterReading automatically the moment any movement's
       status flips to 'live'; nothing here needs to change to revert it. */
    var firstLive = MOVEMENTS.filter(function(m){ return m.status === 'live'; })[0] || null;
    var btnStart = document.getElementById('btnStart');
    btnStart.removeAttribute('disabled');
    btnStart.setAttribute('aria-label', firstLive
      ? 'Begin reading: ' + firstLive.title
      : 'All movements sealed — follow for updates');

    btnStart.addEventListener('click', function(){
      if(!document.body.classList.contains('ready')) return;
      if(firstLive) enterReading(firstLive);
      else openWaitlistModal();
    });

    document.addEventListener('keydown', function(e){
      if(e.key !== 'Enter') return;
      if(!document.body.classList.contains('ready')) return;
      if(document.body.classList.contains('reading')) return;
      if(waitlistOpen) return;
      var active = document.activeElement;
      if(active && (active.tagName === 'BUTTON' || active.tagName === 'A')) return;
      if(firstLive) enterReading(firstLive);
      else openWaitlistModal();
    });

    var waitlistBackdrop = document.getElementById('waitlistBackdrop');
    var waitlistClose    = document.getElementById('waitlistClose');
    waitlistClose.addEventListener('click', closeWaitlistModal);
    waitlistBackdrop.addEventListener('click', closeWaitlistModal);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && waitlistOpen) closeWaitlistModal();
    });

    document.querySelectorAll('.social-link').forEach(function(link){
      var span = link.querySelector('.social-url');
      var final = span.getAttribute('data-final') || span.textContent;
      var tumble = function(){ decode(span, final, 480, DIGITS); };
      link.addEventListener('mouseenter', tumble);
      link.addEventListener('focus', tumble);
    });

    var btnBack = document.getElementById('btnBack');
    btnBack.addEventListener('click', exitReading);
    btnBack.addEventListener('mouseenter', function(){ decode(btnBack, 'Incipit', 280, DIGITS); });
    btnBack.addEventListener('focus',      function(){ decode(btnBack, 'Incipit', 280, DIGITS); });

    window.addEventListener('scroll', function(){
      checkCallLineState();
      updateBgCodeState();
    }, { passive: true });

    window.addEventListener('resize', updateBgCodeSize);

    document.addEventListener('keydown', function(e){
      if(!document.body.classList.contains('reading')) return;
      /* don't intercept if focus is on an interactive element */
      var active = document.activeElement;
      if(active && (active.tagName === 'BUTTON' || active.tagName === 'A')) return;
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown'){
        e.preventDefault();
        scrollToPage(getCurrentPageIndex() + 1);
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        scrollToPage(getCurrentPageIndex() - 1);
      } else if(e.key === 'Escape'){
        exitReading();
      }
    });
  });

})();
