// ==UserScript==
// @name         Measure response time
// @namespace    http://tampermonkey.net/
// @version      2025-09-22
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/*
// @require      https://raw.githubusercontent.com/LenaSYS/ContextFreeLib/refs/heads/master/js/contextfreegrammar.js
// @require      https://raw.githubusercontent.com/LenaSYS/Random-Number-Generator/refs/heads/master/seededrandom.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const WORD_SEED_INFO = 'wordSeedInfo';
    const OLD_VALUE = "oldValue";
    const verb = new Array("warn","encourage","arrange","obtain","skip","spot","treat","spray");

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
            return parseInt(localStorage.getItem(key));
        } else if (type == "json") {
            return JSON.parse(localStorage.getItem(key));
        } else {
            alert(`Unsupported type: ${type}`);
            return null;
        }
    }

    function storeWordSeedInfo(word, randomSeed) {
        let newWord = {'word': word,'seed': randomSeed};

        let words = [];

        const EXISTING_WORDS = getLocalStorage(WORD_SEED_INFO, "json");
        // Get existing words
        if (EXISTING_WORDS != null) {
            words = EXISTING_WORDS;
        }

        // Add the new word
        words.push(newWord);

        // Save back to localStorage
        storeLocalStorage(WORD_SEED_INFO, words, "json");
    }

    function getWordSeedInfo() {
        let words = [];

        const EXISTING_WORDS = getLocalStorage(WORD_SEED_INFO, "json");

        // Get existing words or empty array
        if (EXISTING_WORDS != null) {
            words = EXISTING_WORDS;
        } else {
            words.push("empty");
        }

        return words;
    }

    function saveFilePrompt(words) {
        const response = confirm('Do you want save words information in a excel file?', '5');

        let str = " Word: , Seed: \n";
        if (response) {
            // Take each word
            for (let i = 0; i < words.length; i++) {
                let word = words[i];

                str += word.word + "," + word.seed + "\n";
            }

            let dataBlob = new Blob([str],{type:"text/csv"});
            let objUrl = URL.createObjectURL(dataBlob);
            window.open(objUrl);
        }
    }

    function generateRandomWord(seed) {
        if (seed == undefined || isNaN(seed)) {
            seed = 1;
        }

        Math.setSeed(seed);
        return randomword(verb, true);
    }

    function searchWord(word) {
        let searchInput = document.getElementById("wp-block-search__input-1");

        if (searchInput) {
            searchInput.value = word;

            let searchButton = document.getElementsByClassName("wp-block-search__button")[0];

            if (searchButton) {
                searchButton.click();
            }
        }
    }

    async function run() {

        let start = performance.timeOrigin + performance.now();

        const MAX_RANDOM = 100;
        const RANDOM_SEED = Math.floor(Math.random() * (MAX_RANDOM + 1));

        let randomWord = generateRandomWord(RANDOM_SEED);
        searchWord(randomWord);


        // ------ Stop timer ------
        let end = performance.timeOrigin + performance.now();
        let time = end - start;
        console.log("time: " + time );
    }

    // Start the program
    run();
})();