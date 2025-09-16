// ==UserScript==
// @name         Data generator
// @namespace    http://tampermonkey.net/
// @version      2025-09-16
// @description  try to take over the world!
// @author       You
// @match        *://cms.webug.se/grupp11/wordpress/wp-admin/post-new.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webug.se
// @require      https://raw.githubusercontent.com/LenaSYS/ContextFreeLib/refs/heads/master/js/contextfreegrammar.js
// @grant        none
// @run-at document-start
// ==/UserScript==

(function() {

    const test_int = getRandomInt(10, 20);
    localStorage.setItem("test_number", test_int.toString());

    const content = generateContent();
    localStorage.setItem("ls_content", content);


    function generateContent()
    {
        var sentences="";

        // Generate 5 Sentences with medium probability of each word class and linear probability for all
        for(var i=0;i<5;i++){
            sentences+=generate_sentence(0.5,0.5,0.5,0.5,0,0,0,0,0,0,0);
        }

        // Two line feeds
        sentences+="\n";
        sentences+="\n";

        // Generate a random number of up to 5 sentences with
        //   Higher probability of more nowns and verbs Sentences should be longer since repeated nouns and verbs are common.
        //   Normal distribution for nouns and verbs linear for all others. Nouns and Verbs early in list should appear much more commonly.
        for(var i=0;i<Math.round(Math.random()*5.0);i++){
            sentences+=generate_sentence(0.9,0.9,0.5,0.5,1,1,0,0,0,0,0);
        }

        return sentences;
    }


})();