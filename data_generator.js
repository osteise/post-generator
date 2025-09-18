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

    const seed = localStorage.getItem("LS_COUNTER");
    const content = generateContent(seed);
    const title = generateTitle(seed);
    // spara i localstorage
    localStorage.setItem("ls_content", content);
    localStorage.setItem("ls_title", title);

        function generateContent(seed)
        {
            if (seed==undefined) seed=1;
            Math.setSeed(seed);

            var number_of_paragraphs = getRandomInt(1, 6);  // 1..5
            var number_of_sentences  = getRandomInt(1, 11); // 1..10

            var sentences="";
            // antal stycken
            for(var j=0;j<number_of_paragraphs;j++) {
                // antal meningar per stycke
                for(var i=0;i<number_of_sentences;i++){
                    sentences+=generate_sentence(
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
                // om det inte är sista stycket, lägg till två radbrytningar
                if (j<number_of_paragraphs-1)
                {
                    // Two line feeds
                    sentences+="\n";
                    sentences+="\n";
                }
            }
            return(sentences);
        }

        function generateTitle()
        {
            var raw=generate_sentence(
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

            raw = raw.replace(/\.$/, "");

            // splitta i ord
            var words = raw.split(" ");

            // välj slumpmässigt antal ord mellan 1 och 10
            var wordCount = getRandomInt(1, Math.min(10, words.length) + 1);

            // sätt ihop dessa ord
            var title = words.slice(0, wordCount).join(" ");

            return(title);
        }

})();