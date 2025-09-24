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

      // Ask how many posts to create, if its missing
    if (!localStorage.getItem('SEARCH_TARGET')) {
        // default value = 5, 10 is to tell the browser its an integer
        const n = parseInt(prompt('How many searches do you want to make?', '5'), 10);
        if (!Number.isFinite(n) || n <= 0) return;
        localStorage.setItem('SEARCH_TARGET', String(n));
        localStorage.setItem('SEARCH_COUNTER', '0');
    }

    const search_target = parseInt(localStorage.getItem('SEARCH_TARGET') ?? '0', 10);
    let search_counter = parseInt(localStorage.getItem('SEARCH_COUNTER') ?? '0', 10);

    // Your code here...
    const WORD_SEED_INFO = 'wordSeedInfo';
    const OLD_VALUE = "oldValue";
    //const verb = new Array("warn","encourage","arrange","obtain","skip","spot","treat","spray");

    const SEARCH_RESULTS = 'searchResults'; // [{word, timeMs}]

    function storeSearchResult(word, timeMs) {
        const arr = getLocalStorage(SEARCH_RESULTS, "json") || [];
        arr.push({ word, timeMs: Number(timeMs) });
        storeLocalStorage(SEARCH_RESULTS, arr, "json");
    }

    function getSearchResults() {
        return getLocalStorage(SEARCH_RESULTS, "json") || [];
    }


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

    /*
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
    */

    function saveFilePrompt() {
        const rows = getSearchResults();
        if (!rows.length) {
            return;
        } else {
            if (!confirm('Do you want to save search info as CSV?')) {
                return;
            } else {
                let csv = "Word,TimeMs\n";
                for (const row of rows) csv += `${row.word},${row.timeMs}\n`;

                const dataBlob = new Blob([csv], { type: "text/csv" });
                const objUrl = URL.createObjectURL(dataBlob);
                window.open(objUrl);
            }
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

        // ------ Stop timer ------
        let end = performance.timeOrigin + performance.now();
        let time = end - start;

        // save to local storage
        storeSearchResult(randomWord, Number(time.toFixed(2)));

        console.log("time: " + time );
        search_counter++;
        localStorage.setItem('SEARCH_COUNTER', search_counter);
        console.log("Counter: " + search_counter + "/" + search_target);

        searchWord(randomWord);
    }

    // Start the program
    window.addEventListener('load', function () {
        console.log("It's loaded!");
        if (Number(search_counter) < Number(search_target)) {
            run();
        } else {
            saveFilePrompt();
        }
    })
})();