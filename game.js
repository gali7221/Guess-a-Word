// var $tree = $("#tree");
// console.log($tree.length);
// If length of item is 0, than you will need a document.ready function. 
// If length of item is 1, then you will not need ad ocument.ready function. CHECK

// Lets also cache a few items on the DOM. Easy to use, and good to be smart
var $tree = $("#tree"), 
    $apples = $("#apples"), 
    $message = $("#message"), 
    $spaces = $("#spaces"), 
    $guesses = $("#guesses"), 
    $replay = $("#replay");
// Okay, so lets start out by getting a random word from an array
// We'll have just around 6 words. No Big Deal. 

// Lets create a function to do just that
// We'll wrap into a closure so we cant acccess the word from the browswer console. 


var randomWord = (function() {
    // Create an array that will hold all of the words
    var words = ["octothorpe", "xylophone", "glockenspiel", "marimba", "vibraphone"];
    
    function without() {
        var arr = [];
        var args = Array.prototype.slice.call(arguments);

        // iterate through the words array
        // current word
        
        words.forEach(function(word) {
            if (args.indexOf(word) === -1) { // if it does not exist in the args array
                arr.push(word); // push it into the new array
            }
        });
        return arr; // return the new array
    }
    
    // Invoke a return function
    return function() {
        // Now we want to get a random word
        var word = words[Math.floor(Math.random() * words.length)];
        // once we get the word, we would like to reassign the words array to all of the words except for the given word!
        // Here we will simply splice it.
        // Another way is to
        words = without(word);
        // words = words.filter(function(el) {
        //     return el !== word;
        // });
        return word;
    };
    
})();

// Game constructor
// So what we want is to have the present word be equal to the randomWord from the array

// Lets set up the rest of the Game
// Things that should be set for each game!
// Why do we do this on the Game constructor instead of the prototype
    // If we were to do this on the prototype and we had multiple game objects, properties changing from one will change on the rest of them. 

    // So here for each game, we want incorrect guesses to be set to 0, 


// GAME PLAY 

/*
    ***** GAME CONSTRUCTOR *****
    1. Game constructor holds the word for each game. 
        will get a randomword from the randomWord function
    2. each game consists of incorrects, correct
        if correct_spaces === length of the random word, you win!
    3. get the random word, split the random word into an array. good idea, dawg. 
    4. if there are no more words coming in from the randomWord function, display a message
    5. set one for word === false, display a message
    6. init function is good, too
*/
function Game() {
    this.word = randomWord();
    this.incorrect = 0;
    this.letters_guessed = [];
    this.correct_spaces = 0; // if spaces equal the length of the word, then game is over and you win
    if (!this.word) {
        this.displayMessage("No More Words");
    }
    this.word = this.word.split('');
    this.init();
}

/*
    ****** GAME PROTOTYPE *****
    1. different from the constrcutor because each word will have different specs
        for example, spaces will be set 
    2. once the game starts, you should be set with a spaces with the new word
        be sure to clear all spaces and let it join with a span
        append to the spaces id
    3. init function to store all the events called
    4. bind to have all of the keypress events, etcetera etcetera. 
    5. so a player then types in a letter with his keyboard
        resolve this wtih letter sbeing actual letters
        store in a variable
    6. process the guess, and place on the screen
*/


Game.prototype = {
    guesses: 6,
    displayMessage: function(text) {
        // grab the messages dom element, and send in passed text
        $message.text(text);
    }, 
    createBlanks: function() {
        // so the spaces will be created by what?
        // getting hte size of the present word. creating a new array, and joining by span.
        // spans in css are underlines
        var spaces = (new Array(this.word.length + 1)).join("<span></span>");
        
        // clear all spaces from before. In case of new game
        $spaces.find("span").remove();

        // now append to letters container
        $spaces.append(spaces);

        this.$spaces = $("#spaces span");
    },
    renderGuess: function(letter) {
        $("<span />", {
            text: letter
        }).appendTo($guesses);
    },
    fillBlanks: function(letter) {
        var self = this;

        self.word.forEach(function(l, index) {
            if (letter === l) {
                self.$spaces.eq(index).text(letter);
                self.correct_spaces++;
            }
        });
    },
    duplicateGuess: function(letter) {
        var duplicate = this.letters_guessed.indexOf(letter) !== -1;

        if (!duplicate) {this.letters_guessed.push(letter); }

        return duplicate; // return boolean of letter. 
    },
    processGuess: function(e) {
        // someone types in a letter - only one letter
        var letter = String.fromCharCode(e.which);

        if (notALetter(e.which)) { return; }
        if (this.duplicateGuess(letter)) { return; }

        if ($.inArray(letter, this.word) !== -1) {
            this.fillBlanks(letter);
            this.renderGuess(letter);
            if (this.correct_spaces === this.$spaces.length) { // win condition
                this.win();

            }
        } else {
            this.renderIncorrectGuess(letter);
        }

        if (this.incorrect === this.guesses) {
            this.lose();
        }
    },
    win: function() {
        this.unbind();
        this.displayMessage("you win!");
        this.toggleReplayLink("true");
        this.setGameStatus("win");
    }, 
    lose: function() {
        this.unbind();
        this.displayMessage("Sorry. You're a bum!");
        this.toggleReplayLink("true");
        this.setGameStatus("lose");
    },
    renderIncorrectGuess: function(letter) {
        this.incorrect++;
        this.renderGuess(letter);
        $apples.removeClass().addClass("guess_" + this.incorrect);
    },
    emptyGuesses: function() {
        $guesses.find("span").remove();
    },
    setGameStatus: function(status) {
        $(document.body).removeClass();
        if (status) {
            $(document.body).addClass(status);
        }
    },
    toggleReplayLink: function(which) {
        $replay.toggle(which);
    },
    unbind: function() {
        $(document).off(".game");
    },
    bind: function() {
        $(document).on("keypress.game", this.processGuess.bind(this));
    },
    init: function() {
        // this.unbind(); 
        this.bind();
        // this.setClass();
        this.toggleReplayLink(false);
        this.emptyGuesses();
        this.createBlanks();
        this.setGameStatus();
        this.displayMessage("");

    }
};

function notALetter(code) {
    var a_code = 97, 
        z_code = 122; 

    return code < a_code || code > z_code;
}

$replay.on("click", function(e) {
    e.preventDefault(); 
    new Game(); 
});

new Game();