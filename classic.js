// ==UserScript==
// @name         Classic title and paragraf v2
// @namespace    http://tampermonkey.net/
// @version      2025-09-16
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webug.se
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // Your code here...
    function storeLocalStorage(key, value) {
        localStorage.setItem(key, String(value));
    }

    function getLocalStorage(key) {
        // 10 is to tell the browser its an integer
        return parseInt(localStorage.getItem(key), 10);
    }

     const delay = ms => new Promise(res => setTimeout(res, ms));

    function addTitle() {
        let title = document.getElementById("title");

        if (title) {
            // Add a title name
            title.value = `Auto Title #${1}`;

            let titlePromptText = document.getElementById("title-prompt-text");
            if (titlePromptText) {
                // Hide placeholder
                titlePromptText.className = "screen-reader-text";
            }

            console.log("Title set in editor");
            return;
        }
    }

    function addParagraf() {
        // Get a paragraf window
        let paragrafWindow = document.getElementById("tinymce");

        if (paragrafWindow) {
            let paragraf = paragrafWindow.firstElementChild;

            if (paragraf) {
                 // Add paragraf
                paragraf.innerHTML = `Auto Content #${1}`;
            }

            console.log("Paragraf set in editor");
            return;
        }
    }

    function publishPost() {
        // Get a publish button
        let publishButton = document.getElementById("publish");

        if (publishButton) {
            publishButton.click();
        }

        console.log("Post published");
        return;
    }

    async function run() {
        // --- LocalStorage-keys ---
        const LS_TARGET = '__bulk_target__';
        const LS_COUNT = '__bulk_count__';

        // Ask how many posts to create, if its missing
        if (!getLocalStorage(LS_TARGET)) {
            console.log(getLocalStorage(LS_TARGET));
            // default value = 5, 10 is to tell the browser its an integer
            const n = parseInt(prompt('How many posts do you want to create?', '5'), 10);
            if (!Number.isFinite(n) || n <= 0) return;

            storeLocalStorage(LS_TARGET, n);
            storeLocalStorage(LS_COUNT, 0);
        }

        let currentPost = getLocalStorage(LS_COUNT);
        const totalPosts = getLocalStorage(LS_TARGET);

        console.log(`Progress: ${currentPost}/${totalPosts}`);

        await delay(5000);
        addTitle();

        await delay(5000);
        addParagraf();

        await delay(5000);
        publishPost();

        currentPost++;
        storeLocalStorage(LS_TARGET, currentPost);

        if (currentPost < totalPosts) {
            // Current page URL
            const urlParams = new URLSearchParams(window.location.search);

            // Get "action" value
            const action = urlParams.get("action");

            console.log(action);

            if (true) {
                // Reload for the next post
                await delay(10000)
                window.location.href = "post-new.php";
            }

        } else {
            console.log("All posts done!");
            localStorage.removeItem(LS_TARGET);
            localStorage.removeItem(LS_COUNT);
        }
    }

    await delay(5000);
    run();
})();