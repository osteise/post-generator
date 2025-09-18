// ==UserScript==
// @name         Classic title and paragraph v2
// @namespace    http://tampermonkey.net/
// @version      2025-09-16
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/post.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webug.se
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // Your code here...

    // --- LocalStorage-keys ---
    const LS_TARGET = '__bulk_target__';
    const LS_COUNT = '__bulk_count__';

    function storeLocalStorage(key, value) {
        localStorage.setItem(key, String(value));
    }

    function getLocalStorage(key) {
        // 10 is to tell the browser its an integer
        return parseInt(localStorage.getItem(key), 10);
    }

    function delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    function addTitle(titleText) {
        let title = document.getElementById("title");

        if (title) {
            // Add a title name
            title.value = titleText;

            let titlePromptText = document.getElementById("title-prompt-text");
            if (titlePromptText) {
                // Hide placeholder
                titlePromptText.className = "screen-reader-text";
            }

            console.log("Title added");
        }
    }

    function addParagraph(paragraphText) {
        // Take iframe parent and take a second html tag to prevent run code inside the iframe
        let iframe = document.getElementById("content_ifr");

        if (iframe) {
            let document = iframe.contentDocument || iframe.contentWindow.document;
            let body = document.querySelector("body");

            if (body) {
                body.innerHTML = "<p>" + paragraphText + "</p>";
                console.log("Paragraph added");
            }
        }
    }

    function publishPost() {
        // Get a publish button
        let publishButton = document.getElementById("publish");

        if (publishButton) {
            publishButton.click();
        }

        console.log("Post published");
    }

     function showPrompt() {
        // Ask how many posts to create, if its missing
        if (!getLocalStorage(LS_TARGET)) {
            console.log(getLocalStorage(LS_TARGET));
            // default value = 5, 10 is to tell the browser its an integer
            const n = parseInt(prompt('How many posts do you want to create?', '5'), 10);
            if (!Number.isFinite(n) || n <= 0) {
                return;
            }

            storeLocalStorage(LS_COUNT, 0);
            storeLocalStorage(LS_TARGET, n);
        }
    }

    async function createPost() {
        let currentPost = getLocalStorage(LS_COUNT);

        currentPost++;
        storeLocalStorage(LS_COUNT, currentPost);

        await delay(1000);
        let title = "Auto Title " + currentPost;
        addTitle(title);

        await delay(1000);
        let paragraph = "Auto Paragraph " + currentPost;
        addParagraph(paragraph);

        await delay(2000);
        publishPost();
    }

    async function run() {
        // Prevent double run script inside iframes
        if (window.top !== window.self){
            return;
        }

        const url = window.location.href;

        // If a url is not a edit page then show prompt and create a post; otherwise close edit page tab
        if (!url.includes("post.php") && !url.includes("action=edit")) {
            console.log("On custom page");
            showPrompt();
            createPost();
        } else {
            console.log("On edit page");

            let currentPost = getLocalStorage(LS_COUNT);
            const totalPosts = getLocalStorage(LS_TARGET);

            console.log(`Progress: ${currentPost}/${totalPosts}`);

            if (currentPost < totalPosts) {
                // Open a new post tab and close an old post tab
                window.open('http://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php');
                window.close();
            } else {
                console.log("All posts done!");
                alert("All posts done!");
                localStorage.removeItem(LS_TARGET);
                localStorage.removeItem(LS_COUNT);
            }
        }
    }

    await delay(2000);
    run();
})();