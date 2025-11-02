// ==UserScript==
// @name         Performance
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
    const ITERATION_TARGET = "ITERATION_TARGET";
    const ITERATION_COUNTER = "ITERATION_COUNTER"
    const SEARCH_TARGET = "SEARCH_TARGET";
    const SEARCH_COUNTER = "SEARCH_COUNTER";
    const SEARCH_RESULTS = 'searchResults'; // [{word, seed, timeMs}
    const RANDOM_SEED = "randomSeed";
    const RANDOM_WORD = "randomWord";
    const START_TIME = 'startTime';
    const END_TIME = 'endTime';
    const RESULT_TIME = 'resultTime';

    function showPrompt(targetKey, counterKey, promptMessage, defaultValue, initialCounterValue = 0) {
        // Only prompt if target value is missing
        if (!getLocalStorage(targetKey, "int")) {
            
            const response = prompt(promptMessage, String(defaultValue));
            if (response) {
                const n = parseInt(response, 10);
                if (!Number.isFinite(n) || n <= 0) {
                    return;
                }

                storeLocalStorage(targetKey, n, "int");
                storeLocalStorage(counterKey, initialCounterValue, "int");
                return true;
            } else {
                return false;
            }
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

    function storeSearchResult() {
        let word = getLocalStorage(RANDOM_WORD, "json");
        let randomSeed = getLocalStorage(RANDOM_SEED, 'int');
        let timeMs = getLocalStorage(RESULT_TIME, "int");
        let start = getLocalStorage(START_TIME, "int");
        let end = getLocalStorage(END_TIME, "int");

        let newWord = {'word': word,'seed': randomSeed, 'timeMs': Number(timeMs), 'startTime': Number(start), 'endTime': Number(end)};

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

    function convertEpochMsIntoMS(epochMs) {
        const date = new Date(epochMs);
        const hours = date.getHours(); 
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();
        const totalMs = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000) + milliseconds;
        return totalMs;
    }

    function saveFilePrompt() {
        const wordRows = getSearchResults();

        if (!wordRows.length) {
            return;
        } else {
            if (confirm('Do you want to save search info as CSV?')) {
                let csv = "Word, seed, TimeMs, StartTimeMs, EndTimeMs \n";

                for (const wordRow of wordRows) {
                    const startTimeMs = convertEpochMsIntoMS(wordRow.startTime);
                    const endTimeMs = convertEpochMsIntoMS(wordRow.endTime);

                    csv += `${wordRow.word}, ${wordRow.seed}, ${wordRow.timeMs}, ${startTimeMs}, ${endTimeMs}\n`
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
        let randomWord = randomword(verb, true);

        storeLocalStorage(RANDOM_WORD, randomWord, "json");

        return randomWord;
    }

    function startTime() {
        let start = performance.timeOrigin + performance.now();
        storeLocalStorage(START_TIME, start, "int");
    }

    function endTime() {
        let end = performance.timeOrigin + performance.now();
        storeLocalStorage(END_TIME, end, "int");
    }

    function resultTime() {
        let start = getLocalStorage(START_TIME, "int");
        let end = getLocalStorage(END_TIME, "int");

        let time = end - start;
        storeLocalStorage(RESULT_TIME, time, "int");
    }

    function searchWord(word) {
        let searchInput = document.getElementById("wp-block-search__input-1");

        if (searchInput) {
            searchInput.value = word;

            let searchButton = document.getElementsByClassName("wp-block-search__button")[0];

            if (searchButton) {
                searchButton.click();
                startTime();
            } else {
                console.log("No search button was found");
            }
        } else {
            console.log("No search input was found");
        }
    }

    function run() {
        const search_target = getLocalStorage(SEARCH_TARGET, "int");
        let search_counter = getLocalStorage(SEARCH_COUNTER, 'int');
        
        let seed = search_counter;
        storeLocalStorage(RANDOM_SEED, seed, "int");

        console.log("Seed: " + seed);

        let randomWord = generateRandomWord(seed);
        searchWord(randomWord);

        search_counter++;
        storeLocalStorage(SEARCH_COUNTER, search_counter, "int");
        console.log("Counter: " + search_counter + "/" + search_target);
    }

    // Start the program
    const url = window.location.href;

    if (url.endsWith("wordpress/")) {
        let promptMessage = "How many searches do you want to make?";
        let defaultValue = 5;
        let initialCounterValue = 0;

        if (showPrompt(SEARCH_TARGET, SEARCH_COUNTER, promptMessage, defaultValue, initialCounterValue)) {
            promptMessage = "How many iteration do you want to make?"
            defaultValue = 1;
            initialCounterValue = 1;

            if (showPrompt(ITERATION_TARGET, ITERATION_COUNTER, promptMessage, defaultValue, initialCounterValue)) {
                run();
            } else {
                console.log("canceled");
            }
        } else {
            console.log("canceled");
        }
    } else {
        window.addEventListener('load', function () {
            endTime();
            resultTime();
            console.log("It's loaded!");

            storeSearchResult();

            const search_target = getLocalStorage(SEARCH_TARGET, "int");
            let search_counter = getLocalStorage(SEARCH_COUNTER, "int");

            if (Number(search_counter) < Number(search_target)) {
                run();
            } else {
                const iterationTarget = getLocalStorage(ITERATION_TARGET, "int");
                let iterationCounter = getLocalStorage(ITERATION_COUNTER, "int");
                
                if (iterationCounter < iterationTarget) {
                    search_counter = 0;
                    storeLocalStorage(SEARCH_COUNTER, search_counter, "int");

                    iterationCounter++
                    storeLocalStorage(ITERATION_COUNTER, iterationCounter, "int");
                    run();
                } else {
                    saveFilePrompt();
                    localStorage.removeItem(ITERATION_TARGET);
                    localStorage.removeItem(ITERATION_COUNTER);
                    localStorage.removeItem(SEARCH_TARGET);
                    localStorage.removeItem(SEARCH_COUNTER);
                    localStorage.removeItem(SEARCH_RESULTS);
                    localStorage.removeItem(RANDOM_SEED);
                    localStorage.removeItem(RANDOM_WORD);
                    localStorage.removeItem(START_TIME);
                    localStorage.removeItem(END_TIME);
                    localStorage.removeItem(RESULT_TIME);
                }
            }
        })
    }
})();