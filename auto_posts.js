// ==UserScript==
// @name         Auto posts
// @version      1.1
// @match        *://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php*
// @description   Try to take over the world!
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webug.se
// @grant        none
// @require      https://raw.githubusercontent.com/LenaSYS/ContextFreeLib/refs/heads/master/js/contextfreegrammar.js
// ==/UserScript==

(function() {

  // --- LocalStorage-keys ---
  const LS_TARGET = '__bulk_target__';
  const LS_COUNT  = '__bulk_count__';

  // Ask how many posts to create, if its missing
  if (!localStorage.getItem(LS_TARGET)) {
      // default value = 5, 10 is to tell the browser its an integer
    const n = parseInt(prompt('How many posts do you want to create?', '5'), 10);
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(LS_TARGET, String(n));
    localStorage.setItem(LS_COUNT, '0');
  }

  // Admin-base: /grupp11/wordpress/wp-admin/
  function getAdminBase() {
    if (window.ajaxurl) return window.ajaxurl.replace(/admin-ajax\.php.*/, '');
    const m = location.href.match(/^(https?:\/\/[^/]+\/.*?\/wp-admin\/)/i);
    return m ? m[1] : (location.origin + '/wp-admin/');
  }
  const adminBase = getAdminBase();

  // Temporary word generator – needs to be replaced
  function makePost(i) {
      return {
      title:   `Auto Title #${i + 1} Random Number = ${localStorage.getItem("test_number")}`,
      content: `<p>${localStorage.getItem("ls_content")}</p>`
    };
  }

    // To reset counter in localstorage
    // localStorage.removeItem('__bulk_target__');
    // localStorage.removeItem('__bulk_count__');

  // --- Inject code into the page context so that wp.data exists ---
  const code = `
    (function (adminBase, LS_TARGET, LS_COUNT, makePostStr) {
      function waitForEditorReady(cb) {
        (function tick() {
          try {
            if (
              window.wp && wp.data && wp.data.select && wp.data.dispatch &&
              wp.data.select('core/editor') &&
              wp.data.select('core/editor').getCurrentPost()
            ) return cb();
          } catch (_) {}
          setTimeout(tick, 120);
        })();
      }

      function publishOne(index) {
        const makePost = eval('(' + makePostStr + ')');
        const target = Number(localStorage.getItem(LS_TARGET) || 0);
        const done   = Number(localStorage.getItem(LS_COUNT)  || 0);

        if (!target || done >= target) {
          console.log('[userscript] Goal achieved:', done, '/', target);
          // Clear keys if you want to end loop permanently
          // localStorage.removeItem(LS_TARGET);
          // localStorage.removeItem(LS_COUNT);
          return;
        }

        const { title, content } = makePost(index);

        const { dispatch, select } = wp.data;
        const store = 'core/editor';

        // 1) Fill and save first
        dispatch(store).editPost({ title, content, status: 'draft' });
        dispatch(store).savePost();

        const unsub = wp.data.subscribe(() => {
          const isSaving = select(store).isSavingPost();
          const didSave  = select(store).didPostSaveRequestSucceed?.();
          if (!isSaving && didSave) {
            unsub();

            // 2) Publish (with fallback)
            setTimeout(() => {
              try { dispatch(store).publishPost(); }
              catch { dispatch(store).editPost({ status: 'publish' }); dispatch(store).savePost(); }

              const unsub2 = wp.data.subscribe(() => {
                const stillSaving = select(store).isSavingPost();
                const post = select(store).getCurrentPost();
                if (!stillSaving && post && post.status === 'publish') {
                  unsub2();

                  // 3) Increase counter in localstorage
                  const newCount = Number(localStorage.getItem(LS_COUNT) || 0) + 1;
                  localStorage.setItem(LS_COUNT, String(newCount));
                  console.log('[userscript] Published:', newCount, '/', target);

                  // 4) Continue or exit
                  if (newCount < target) {
                    // New post
                    location.assign(adminBase + 'post-new.php');
                  } else {
                    console.log('[userscript] DONR – created', newCount, 'posts.');
                    // To clear
                    // localStorage.removeItem(LS_TARGET);
                    // localStorage.removeItem(LS_COUNT);
                  }
                }
              });
            }, 50);
          }
        });
      }

      waitForEditorReady(() => {
        const done = Number(localStorage.getItem(LS_COUNT) || 0);
        publishOne(done); // index = how many are already made
      });
    })('${adminBase}', '${LS_TARGET}', '${LS_COUNT}', ${makePost.toString()});
  `;

  const s = document.createElement('script');
  s.textContent = code;
  (document.head || document.documentElement).appendChild(s);
  s.remove();
} )();