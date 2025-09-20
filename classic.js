// ==UserScript==
// @name         Classic title and paragraph v2
// @namespace    http://tampermonkey.net/
// @version      2025-09-16
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/post.php*
// @require      https://raw.githubusercontent.com/LenaSYS/ContextFreeLib/refs/heads/master/js/contextfreegrammar.js
// @require      https://raw.githubusercontent.com/LenaSYS/Random-Number-Generator/refs/heads/master/seededrandom.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webug.se
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // Your code here...

    // --- LocalStorage-keys ---
    const LS_TARGET = '__bulk_target__';
    const LS_COUNT = '__bulk_count__';
    const POST_SEED_INFO = 'postSeedInfo';

    function storeLocalStorage(key, value, type) {
        if (type == "int") {
            localStorage.setItem(key, String(value));
            return true;
        } else if (type == "json") {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } else {
            alert(`Unsupported type: ${type}`);
            return false;
        }
    }

    function getLocalStorage(key, type) {
        if (type == "int") {
            // 10 is to tell the browser its an integer
            return parseInt(localStorage.getItem(key), 10);
        } else if (type == "json") {
            return JSON.parse(localStorage.getItem(key));
        } else {
            alert(`Unsupported type: ${type}`);
            return null;
        }
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
                body.innerHTML = paragraphText;
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
        if (!getLocalStorage(LS_TARGET, "int")) {

            // default value = 5, 10 is to tell the browser its an integer
            const n = parseInt(prompt('How many posts do you want to create?', '5'), 10);
            if (!Number.isFinite(n) || n <= 0) {
                return;
            }

            storeLocalStorage(LS_COUNT, 0, "int");
            storeLocalStorage(LS_TARGET, n, "int");
        }
    }

    function generateTitle(seed) {
        if (seed == undefined || isNaN(seed))
        {
            seed = 1;
        }

        Math.setSeed(seed);

        let sentences="";

        sentences += generate_sentence(
            Math.random(), // prob noun
            Math.random(), // prob verb
            Math.random(), // prob dual adj
            Math.random(), // prob adj
            Math.random(), // dist noun
            Math.random(), // dist verb
            Math.random(), // dist adjective
            Math.random(), // dist adverb
            Math.random(), // dist determiner
            Math.random(), // dist conjunction
            Math.random()  // dist modals
        );

        // Removes a trailing dots from the title
        sentences = sentences.replace(/\.$/, "");

        // splits the sentences into an array of words,
        let words = sentences.split(" ");

        const MAX_WORDS = 10;
        const maxPossible = Math.min(MAX_WORDS, words.length);

        // choose a random total word count between 1 and maxPossible
        let wordCount = getRandomInt(1, maxPossible + 1);

        // combine the first "wordCount" words into a single string
        let title = words.slice(0, wordCount).join(" ");

        storePostSeedInfo(title, seed);   

        return title;
    }

    function generateContent(seed)
    {
        if (seed == undefined || isNaN(seed)) {
            seed = 1; 
        }

        Math.setSeed(seed);

        let numberOfParagraphs = getRandomInt(1, 6);  // 1..5
        
        let paragraphs = "";

        // total number of paragraphs
        for(let i = 0; i < numberOfParagraphs; i++) {
            let numberOfSentences  = getRandomInt(1, 11); // 1..10
            let paragraph = "";

            // total sentences per paragraph
            for(let j = 0; j < numberOfSentences; j++){
                paragraph += generate_sentence(
                    Math.random(), // prob noun
                    Math.random(), // prob verb
                    Math.random(), // prob dual adj
                    Math.random(), // prob adj
                    Math.random(), // dist noun
                    Math.random(), // dist verb
                    Math.random(), // dist adjective
                    Math.random(), // dist adverb
                    Math.random(), // dist determiner
                    Math.random(), // dist conjunction
                    Math.random()  // dist modals
                ); 
            }

            // wrap each paragraph in <p> tags
            paragraphs += `<p>${paragraph}</p>\n`;
        }

        return paragraphs;
    }

    function storePostSeedInfo(title, randomSeed) {
        let newPost = `Title: \"${title}\" and seed is: ${randomSeed}`;

        let posts = [];

        const EXISTING_POSTS = getLocalStorage(POST_SEED_INFO, "json");
        // Get existing posts or empty array
        if (EXISTING_POSTS != null) {
            posts = EXISTING_POSTS;
        }

        // Add the new post
        posts.push(newPost);

        // Save back to localStorage
        storeLocalStorage(POST_SEED_INFO, posts, "json");
    }

    function getPostSeedInfo() {
        let posts = [];

        const EXISTING_POSTS = getLocalStorage(POST_SEED_INFO, "json");

        // Get existing posts or empty array
        if (EXISTING_POSTS != null) {
            posts = EXISTING_POSTS;
        } else {
            posts.push("empty");
        }

        return posts;
    }

    async function createPost() {
        const MAX_RANDOM = 100;
        const RANDOM_SEED = Math.floor(Math.random() * (MAX_RANDOM + 1));
        
        let currentPost = getLocalStorage(LS_COUNT, "int");

        currentPost++;
        storeLocalStorage(LS_COUNT, currentPost, "int");
        
        let title = generateTitle(RANDOM_SEED);
        addTitle(title);

        let paragraph = generateContent(RANDOM_SEED);
        addParagraph(paragraph);

        await delay(1000);
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

            let currentPost = getLocalStorage(LS_COUNT, "int");
            const totalPosts = getLocalStorage(LS_TARGET, "int");

            console.log(`Progress: ${currentPost}/${totalPosts}`);

            if (currentPost < totalPosts) {
                // Open a new post tab and close a old post tab
                window.open('http://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php');
                window.close();
            } else {
                console.log("All posts done!");
                alert("All posts done!");

                // Show post seed info
                let posts = getPostSeedInfo();
                console.log(posts);

                localStorage.removeItem(LS_TARGET);
                localStorage.removeItem(LS_COUNT);
                localStorage.removeItem(POST_SEED_INFO);
            }
        }
    }

    await delay(1000);
    run();
})();