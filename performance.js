// ==UserScript==
// @name         Measure response time
// @namespace    http://tampermonkey.net/
// @version      2025-09-22
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    var start = performance.timeOrigin + performance.now();

    let searchInput = document.getElementById("wp-block-search__input-1");

    searchInput.value = "cat";

    let searchButton = document.getElementsByClassName("wp-block-search__button wp-element-button")[0];
    searchButton.click();

    // ------ Stop timer ------
    var end = performance.timeOrigin + performance.now();
    var time = end - start;
    console.log("time: " + time );
})();