// ==UserScript==
// @name         Oskar Measure response time
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

    // Keys for measuring between navigations
    const P_START = 'PENDING_START_MS';
    const P_WORD  = 'PENDING_WORD';
    const P_SEED  = 'PENDING_SEED';

      // Ask how many searches to run, if its missing
    if (!localStorage.getItem('SEARCH_TARGET')) {
        const n = parseInt(prompt('How many searches do you want to make?', '5'), 10);
        if (!Number.isFinite(n) || n <= 0) return;
        localStorage.setItem('SEARCH_TARGET', String(n));
        localStorage.setItem('SEARCH_COUNTER', '0');
    }

    const search_target = parseInt(localStorage.getItem('SEARCH_TARGET') ?? '0', 10);
    let search_counter = parseInt(localStorage.getItem('SEARCH_COUNTER') ?? '0', 10);

    const SEARCH_RESULTS = 'searchResults';

    function fmt(ts) {
        // ts = unix ms (number)
        const d = new Date(ts);
        const pad = (n, w=2) => String(n).padStart(w,'0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.` +
            `${pad(d.getMilliseconds(),3)}`;
    }

    function getNavMetrics() {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
            const ttfb = Math.max(0, nav.responseStart - nav.requestStart);
            return { ttfb_ms: +ttfb.toFixed(3) };
        } else {
            return { ttfb_ms: null };
        }
    }

    function storeSearchResult(word, timeMs, seed, startTime, endTime, metrics) {
        const arr = getLocalStorage(SEARCH_RESULTS, "json") || [];
        arr.push({
            word,
            timeMs: Number(timeMs),
            seed: Number(seed),
            start: fmt(startTime),
            end:   fmt(endTime),
            ttfb_ms: metrics?.ttfb_ms ?? null
        });
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

    function saveFilePrompt() {
        const rows = getSearchResults();
        if (!rows.length) {
            return;
        } else {
            if (!confirm('Do you want to save search info as CSV?')) {
                return;
            } else {
                let csv = "Word,TimeTotalMs,Seed,Start,End,TTFBms\n";
                for (const row of rows) {
                    csv += [
                        row.word,
                        row.timeMs,
                        row.seed,
                        row.start,
                        row.end,
                        (row.ttfb_ms ?? "")
                    ].join(",") + "\n";
                }
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

    function resultPage() {

        const startMs = Number(sessionStorage.getItem(P_START));
        const word = sessionStorage.getItem(P_WORD);
        const seed = Number(sessionStorage.getItem(P_SEED));

        if (Number.isFinite(startMs) && word != null && Number.isFinite(seed)) {
            const endMs = Date.now();
            const time = endMs - startMs;

            const metrics = getNavMetrics();
            storeSearchResult(word, Number(time.toFixed(3)), seed, startMs, endMs, metrics);

            // clear search and reset counter
            sessionStorage.removeItem(P_START);
            sessionStorage.removeItem(P_WORD);
            sessionStorage.removeItem(P_SEED);

            search_counter++;
            localStorage.setItem('SEARCH_COUNTER', String(search_counter));
            console.log(`Stored: "${word}" ${time.toFixed(3)} ms (${search_counter}/${search_target})`);
        }

        // continue or save
        if (search_counter < search_target) {
            // go back to start page
            location.href = location.origin + '/grupp11/wordpress/';
        }
    }

    // start search on startpage, not result page
    async function run() {
        const seed = getLocalStorage('SEARCH_COUNTER', 'int');
        const randomWord = generateRandomWord(seed);

        // save start, word and seed before loading new page
        const start = Date.now();
        sessionStorage.setItem(P_START, String(start));
        sessionStorage.setItem(P_WORD, randomWord);
        sessionStorage.setItem(P_SEED, String(seed));

        searchWord(randomWord);
    }

    // start the program
    window.addEventListener('load', function () {
        console.log("It's loaded!");
        resultPage();

        const params = new URLSearchParams(location.search);
        // if not the start page
        if (!params.has('s')) {
            if (Number(search_counter) < Number(search_target)) {
                run();
            } else {
                saveFilePrompt();
            }
        } else {
            if (Number(search_counter) < Number(search_target)) {
                resultPage();
            } else {
                saveFilePrompt();
            }
        }

    })
})();