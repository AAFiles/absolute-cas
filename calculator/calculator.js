/*
  Absolute CAS student wrapper: help guide, quick tour, keypad toggle and clear session.

  Integration layer only. The calculator core (served from the site root) is not modified.
  Frame changes are applied to the same-origin core document, so they can be removed by
  deleting this file's overrides. Nothing typed into the calculator is read, stored or sent
  by this script. The only stored data is the calculator core's own IndexedDB database,
  which Clear session deletes.
*/
(function () {
  'use strict';

  // IndexedDB database the calculator core uses for saved documents (found in the core bundle).
  var DB_NAME = 'keyval-store';
  var CORE_URL = new URL('../', document.baseURI).href;

  // Applied inside the core document. The keypad column is hidden until a student asks for it.
  // The screen column takes the whole height. Status text truncates instead of clipping.
  var FRAME_CSS = [
    'html.abs-keypad-off .shell{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important}',
    'html.abs-keypad-off .shell>:has(>[data-testid="keypad"]){display:none!important}',
    '[data-testid="cas-status"]{flex-shrink:1!important;min-width:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
  ].join('');

  var TOUR = [
    {
      title: 'Type straight away',
      text: 'Click inside the calculator, then type. Your physical keyboard works straight away. Press Enter to calculate.',
      showCalc: true
    },
    {
      title: 'Show the keypad when you need it',
      text: 'The keypad is hidden at first. Select Show keypad in the top bar to display the on-screen keys and the touchpad arrows. Tap ctrl or shift, then a key, to use the small label above it.'
    },
    {
      title: 'Fractions and shortcuts',
      text: 'Press ▯/▯ to insert a fraction template, then press Tab to move to the next box. Ctrl+S saves the document, and Ctrl+Z undoes your last change.'
    },
    {
      title: 'Start fresh',
      text: 'Press Del to delete, or ctrl then Del to clear the entry line. For a new document, use doc, then File, then New Document. Clear session in the top bar deletes everything saved on this device.'
    }
  ];

  var frame = document.getElementById('calc-frame');
  var keypadBtn = document.getElementById('keypad-toggle');
  var helpOpen = document.getElementById('help-open');
  var clearOpen = document.getElementById('clear-open');
  var helpDialog = document.getElementById('help-dialog');
  var tourDialog = document.getElementById('tour-dialog');
  var clearDialog = document.getElementById('clear-dialog');
  var clearConfirm = document.getElementById('clear-confirm');
  var clearCancel = document.getElementById('clear-cancel');
  var clearMsg = document.getElementById('clear-msg');
  var frameNote = document.getElementById('frame-note');
  var announcer = document.getElementById('status');
  var tourBack = document.getElementById('tour-back');
  var tourNext = document.getElementById('tour-next');
  var tourCalc = document.getElementById('tour-calc');
  var tourTitle = document.getElementById('tour-title');
  var tourText = document.getElementById('tour-text');
  var tourProgress = document.getElementById('tour-progress');

  var keypadShown = false;
  var clearing = false;
  var tourIndex = 0;

  function announce(text) {
    announcer.textContent = text;
  }

  // Returns the core document when it is same-origin and loaded, otherwise null.
  function frameDoc() {
    try {
      var doc = frame.contentDocument;
      if (doc && doc.location && doc.location.href.indexOf(CORE_URL) === 0) {
        return doc;
      }
    } catch (err) {
      // Cross-origin or blocked frame: treat as unavailable.
    }
    return null;
  }

  // Injects the overrides and applies the keypad state. Returns false if the core is unavailable.
  function applyFrameState() {
    var doc = frameDoc();
    if (!doc || !doc.documentElement) {
      return false;
    }
    if (!doc.getElementById('abs-student-overrides')) {
      var style = doc.createElement('style');
      style.id = 'abs-student-overrides';
      style.textContent = FRAME_CSS;
      (doc.head || doc.documentElement).appendChild(style);
    }
    doc.documentElement.classList.toggle('abs-keypad-off', !keypadShown);
    return true;
  }

  function onFrameReady() {
    if (clearing) {
      return;
    }
    var ok = applyFrameState();
    frame.setAttribute('aria-busy', 'false');
    frameNote.hidden = ok;
    keypadBtn.disabled = !ok;
  }

  frame.addEventListener('load', onFrameReady);
  // The load event can fire before this script runs. Apply the state now if the core is ready.
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
    onFrameReady();
  }

  // ---------- Keypad ----------

  keypadBtn.addEventListener('click', function () {
    keypadShown = !keypadShown;
    applyFrameState();
    keypadBtn.setAttribute('aria-expanded', String(keypadShown));
    keypadBtn.textContent = keypadShown ? 'Hide keypad' : 'Show keypad';
    announce(keypadShown ? 'Keypad shown.' : 'Keypad hidden.');
  });

  // ---------- Focus helpers ----------

  function focusCalculator() {
    var doc = frameDoc();
    var target = doc && doc.querySelector('math-field, [contenteditable="true"], textarea');
    if (target && typeof target.focus === 'function') {
      target.focus();
      return;
    }
    frame.focus();
  }

  // Dialogs return focus to their opener when closed. Pass moveFocusElsewhere = true when the
  // caller is about to move focus itself, so the opener does not take focus back afterwards.
  function openDialog(dlg, opener) {
    dlg.returnFocusTo = opener || null;
    if (!dlg.open) {
      dlg.showModal();
    }
  }

  function closeDialog(dlg, moveFocusElsewhere) {
    if (moveFocusElsewhere) {
      dlg.returnFocusTo = null;
    }
    if (dlg.open) {
      dlg.close();
    }
  }

  [helpDialog, tourDialog, clearDialog].forEach(function (dlg) {
    dlg.addEventListener('close', function () {
      var back = dlg.returnFocusTo;
      dlg.returnFocusTo = null;
      if (back && typeof back.focus === 'function') {
        back.focus();
      }
    });
    // Clicking the backdrop (outside the sheet body) dismisses, except while clearing.
    dlg.addEventListener('click', function (event) {
      if (event.target === dlg && !(dlg === clearDialog && clearing)) {
        closeDialog(dlg);
      }
    });
  });

  // ---------- Help guide ----------

  helpOpen.addEventListener('click', function () {
    openDialog(helpDialog, helpOpen);
  });

  helpDialog.addEventListener('click', function (event) {
    var control = event.target.closest && event.target.closest('[data-action]');
    if (!control) {
      return;
    }
    var action = control.getAttribute('data-action');
    if (action === 'close-help') {
      closeDialog(helpDialog);
    } else if (action === 'tour') {
      // Move from the guide to the tour. The tour returns focus to the help button.
      closeDialog(helpDialog, true);
      startTour();
    }
  });

  // ---------- Quick tour ----------

  function renderTour() {
    var step = TOUR[tourIndex];
    tourProgress.textContent = 'Step ' + (tourIndex + 1) + ' of ' + TOUR.length;
    tourTitle.textContent = step.title;
    tourText.textContent = step.text;
    tourCalc.hidden = !step.showCalc;
    tourBack.setAttribute('aria-disabled', String(tourIndex === 0));
    tourNext.textContent = tourIndex === TOUR.length - 1 ? 'Finish' : 'Next';
  }

  function startTour() {
    tourIndex = 0;
    renderTour();
    openDialog(tourDialog, helpOpen);
    tourTitle.focus();
  }

  tourDialog.addEventListener('click', function (event) {
    var control = event.target.closest && event.target.closest('[data-action]');
    if (!control) {
      return;
    }
    switch (control.getAttribute('data-action')) {
      case 'tour-back':
        if (tourIndex > 0) {
          tourIndex -= 1;
          renderTour();
        }
        break;
      case 'tour-next':
        if (tourIndex < TOUR.length - 1) {
          tourIndex += 1;
          renderTour();
        } else {
          closeDialog(tourDialog);
        }
        break;
      case 'tour-skip':
        closeDialog(tourDialog);
        break;
      case 'tour-calc':
        closeDialog(tourDialog, true);
        focusCalculator();
        break;
      default:
        break;
    }
  });

  // ---------- Clear session ----------

  clearOpen.addEventListener('click', function () {
    clearMsg.textContent = '';
    clearConfirm.disabled = false;
    clearCancel.disabled = false;
    openDialog(clearDialog, clearOpen);
    clearCancel.focus();
  });

  clearCancel.addEventListener('click', function () {
    closeDialog(clearDialog);
  });

  // Unload the core so its open IndexedDB connection closes. Resolves on load or after a short timeout.
  function releaseFrame() {
    return new Promise(function (resolve) {
      var finished = false;
      function finish() {
        if (!finished) {
          finished = true;
          frame.removeEventListener('load', finish);
          resolve();
        }
      }
      frame.addEventListener('load', finish);
      frame.src = 'about:blank';
      setTimeout(finish, 1500);
    });
  }

  // Deletes only the calculator's own database. Other data on this origin is left alone.
  function deleteCalculatorData() {
    return new Promise(function (resolve) {
      var request;
      if (!window.indexedDB) {
        resolve({ ok: true });
        return;
      }
      try {
        request = indexedDB.deleteDatabase(DB_NAME);
      } catch (err) {
        resolve({ ok: false });
        return;
      }
      var timer = setTimeout(function () {
        resolve({ ok: false, blocked: true });
      }, 10000);
      request.onsuccess = function () {
        clearTimeout(timer);
        resolve({ ok: true });
      };
      request.onerror = function () {
        clearTimeout(timer);
        resolve({ ok: false });
      };
      request.onblocked = function () {
        clearMsg.textContent = 'Close any other Absolute CAS tabs or windows. The saved data will be deleted once they close.';
      };
    });
  }

  async function clearSession() {
    clearing = true;
    clearConfirm.disabled = true;
    clearCancel.disabled = true;
    clearMsg.textContent = 'Clearing…';
    frame.setAttribute('aria-busy', 'true');
    var result;
    try {
      await releaseFrame();
      result = await deleteCalculatorData();
    } finally {
      clearing = false;
    }

    clearConfirm.disabled = false;
    clearCancel.disabled = false;

    if (!result.ok) {
      clearMsg.textContent = result.blocked
        ? 'Couldn’t clear the saved data because another Absolute CAS tab is still open. Close it and try again.'
        : 'Couldn’t clear the saved data. Refresh the page and try again.';
      frame.src = CORE_URL;
      return;
    }

    keypadShown = false;
    keypadBtn.textContent = 'Show keypad';
    keypadBtn.setAttribute('aria-expanded', 'false');
    frame.src = CORE_URL;
    closeDialog(clearDialog);
    announce('Session cleared. The calculator is blank and ready to use.');
  }

  clearConfirm.addEventListener('click', function () {
    clearSession();
  });
})();
