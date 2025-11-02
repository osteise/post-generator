// ==UserScript==
// @name         Add a post
// @namespace    http://tampermonkey.net/
// @version      2025-09-15
// @description  try to take over the world!
// @author       You
// @match        http://cms.webug.se/grupp11/wordpress/wp-admin/edit.php
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    let addPostButton = document.getElementsByClassName("page-title-action")[0];
    window.addEventListener("load", () => {
        if(addPostButton) {
            addPostButton.click();
        }
    });
})();