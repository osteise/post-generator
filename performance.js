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
    const SEARCH_TARGET = "SEARCH_TARGET";
    const SEARCH_COUNTER = "SEARCH_COUNTER";
    const SEARCH_RESULTS = 'searchResults'; // [{word, seed, timeMs}

    function showPrompt() {
        // Ask how many searches to run, if its missing
        if (!getLocalStorage(SEARCH_TARGET, "int")) {

            // default value = 5, 10 is to tell the browser its an integer
            const n = parseInt(prompt('How many searches do you want to make?', '5'), 10);
            if (!Number.isFinite(n) || n <= 0) {
                return;
            }

            storeLocalStorage(SEARCH_TARGET, n, "int");
            storeLocalStorage(SEARCH_COUNTER, 0, "int");
        }
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

    function storeSearchResult(word, randomSeed, timeMs) {
        let newWord = {'word': word,'seed': randomSeed, 'timeMs': Number(timeMs)};

        let words = [];

        const EXISTING_SEARCH_RESULTS = getLocalStorage(SEARCH_RESULTS, "json");
        // Get existing words
        if (EXISTING_SEARCH_RESULTS != null) {
            words = EXISTING_SEARCH_RESULTS;
        }

        // Add the new word
        words.push(newWord);

        // Save back to localStorage
        storeLocalStorage(SEARCH_RESULTS, words, "json");
    }

    function getSearchResults() {
        let words = [];

        const EXISTING_WORDS = getLocalStorage(SEARCH_RESULTS, "json");

        // Get existing words or empty array
        if (EXISTING_WORDS != null) {
            words = EXISTING_WORDS;
        } else {
            words.push("empty");
        }

        return words;
    }

    function saveFilePrompt() {
        const wordRows = getSearchResults();

        if (!wordRows.length) {
            return;
        } else {
            if (confirm('Do you want to save search info as CSV?')) {
                let csv = "Word, seed, TimeMs \n";

                for (const wordRow of wordRows) {
                    csv += `${wordRow.word}, ${wordRow.seed}, ${wordRow.timeMs}\n`
                };
                
                // create a blob
                const dataBlob = new Blob([csv], { type: "text/csv" });
                const objUrl = URL.createObjectURL(dataBlob);

                // create a link
                const link = document.createElement("a");
                link.href = objUrl;
                link.download = "data.csv";
                document.body.appendChild(link);

                // call download
                link.click();

                // remove link
                document.body.removeChild(link);

                // release a object to free up memory 
                URL.revokeObjectURL(objUrl);
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
            } else {
                console.log("No search button was found");
            }
        } else {
            console.log("No search input was found");
        }
    }

    function run() {   
        let start = performance.timeOrigin + performance.now();

        const MAX_RANDOM = 100;
        const RANDOM_SEED = Math.floor(Math.random() * (MAX_RANDOM + 1));

        let randomWord = generateRandomWord(RANDOM_SEED);

        // ------ Stop timer ------
        let end = performance.timeOrigin + performance.now();
        let time = end - start;

        // save to local storage
        storeSearchResult(randomWord, RANDOM_SEED, Number(time.toFixed(2)));

        console.log("time: " + time );

        const search_target = getLocalStorage(SEARCH_TARGET, "int") || 0;
        let search_counter = getLocalStorage(SEARCH_COUNTER, "int") || 0;

        search_counter++;
        storeLocalStorage(SEARCH_COUNTER, search_counter, "int");
        console.log("Counter: " + search_counter + "/" + search_target);

        searchWord(randomWord);
    }

    // Start the program
    window.addEventListener('load', function () {
        console.log("It's loaded!");

        const search_target = getLocalStorage(SEARCH_TARGET, "int");
        let search_counter = getLocalStorage(SEARCH_COUNTER, "int");

        if (isNaN(search_target) && isNaN(search_counter)) {
            showPrompt();
            run();
        } else {
            if (Number(search_counter) < Number(search_target)) {
                run();
            } else {
                saveFilePrompt();
                localStorage.removeItem(SEARCH_TARGET);
                localStorage.removeItem(SEARCH_COUNTER);
                localStorage.removeItem(SEARCH_RESULTS);
            }
        }
    })
})();