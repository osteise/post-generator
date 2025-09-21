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

    localStorage.removeItem('ls_content');
    localStorage.removeItem('ls_title');

    let seed = localStorage.getItem('__bulk_count__');
    if(isNaN(seed)) seed = 1 ;
    console.log("Seed: "+seed);
    //Math.setSeed(seed);

    function jsf32(a, b, c, d) {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = a - (b << 23 | b >>> 9) | 0;
        a = b ^ (c << 16 | c >>> 16) | 0;
        b = c + (d << 11 | d >>> 21) | 0;
        b = c + d | 0;
        c = d + t | 0;
        d = a + t | 0;
        return (d >>> 0) / 4294967296;
    }

    Math.random = function() {
        var ran=jsf32(0xF1EA5EED,Math.randSeed+6871,Math.randSeed+1889,Math.randSeed+56781);
        Math.randSeed+=Math.floor(ran*37237);
        return(ran)
    }

    Math.setSeed = function(seed){
        Math.randSeed=seed;
        for(var i=0;i<7;i++) Math.random();
    }

    var origRandom = Math.random;
    Math.randSeed = Math.floor(Date.now());




    let content = generateContent();
    let title = generateTitle();
    // spara i localstorage
    localStorage.setItem("ls_content", content);
    localStorage.setItem("ls_title", title);

        function generateContent()
        {
            var number_of_paragraphs = getRandomInt(1, 6);  // 1..5

            var sentences="";
            // antal stycken
            for(var j=0;j<number_of_paragraphs;j++) {
                // antal meningar per stycke
                var number_of_sentences  = getRandomInt(1, 11); // 1..10
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
            //Math.setSeed();

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