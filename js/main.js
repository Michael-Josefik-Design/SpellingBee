const alphaLetters = document.getElementsByClassName('alpha-letter');
const word = document.getElementById('word');
const newWordBtn = document.getElementById('new-word');
const colorSelect = document.getElementById('color-selection');
const wordListChoices = document.getElementsByClassName('wordlist-choice');
const categoryDisplay = document.getElementById('category');
const clock = document.getElementById('clock');
const score = document.getElementById('score');
const winScore = document.getElementById('win-score');
const winWord = document.getElementById('win-word');
const listChoices = document.getElementById('list-choices');
const listEditor = document.getElementById('edit-screen');

const gameScreens = {
    start: {
        element: document.getElementById('start-screen'),
        active: true
    },
    game: {
        element: document.getElementById('game-board'),
        active: false
    },
    win: {
        element: document.getElementById('win-screen'),
        active: false
    },
    pause: {
        element: document.getElementById('pause-screen'),
        active: false
    },
    listEditor: {
        element: document.getElementById('edit-screen'),
        active: false
    }
}

let wordLists;
const defaultWordList = {
    colors1: {
        name: 'Colors: Level 1',
        words: [
            'red',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple'
        ],
        highScores: [
            
        ],
        default: true
    },
    colors2: {
        name: 'Colors: Level 2',
        words: [
            'pink',
            'brown',
            'black',
            'white',
            'gray',
            'teal'
        ],
        highScores: [
            
        ],
        default: false
    },
    sightWords1: {
        name: 'Sight Words: Level 1',
        words: [
            'the',
            'see',
            'we',
            'and',
            'how',
            'find',
            'this',
            'play',
            'down'
        ],
        highScores: [
            
        ],
        default: false
    },
    sightWords2: {
        name: 'Sight Words: Level 2',
        words: [
            'red',
            'orange',
            'yellow',
            'green',
            'blue',
            'purple'
        ],
        highScores: [
            
        ],
        default: false
    },
    animals1: {
        name: 'Animals: Level 1',
        words: [
            'fox',
            'pig',
            'dog',
            'fish',
            'sheep',
            'horse'
        ],
        highScores: [
            
        ],
        default: false
    },
    animals2: {
        name: 'Animals: Level 2',
        words: [
            'duck',
            'deer',
            'lion',
            'cat',
            'bird',
            'snake'
        ],
        highScores: [
            
        ],
        default: false
    }
}




function sortHighscores() {
    HIGHSCORES.sort(function(a, b){return b.score - a.score});
    console.log(HIGHSCORES);
}

function saveHighscore() {
    let scoreObj = {name: player, score: SCORE};
    HIGHSCORES.push(scoreObj);
    sortHighscores();
    let scoreString = JSON.stringify(HIGHSCORES);
    localStorage.setItem('highscores', scoreString);
}

function checkHighscore() {
    if (
        HIGHSCORES.length === 0 || 
        HIGHSCORES.length < 10 && HIGHSCORES.length > 0) {
        saveHighscore();
    } else {
        let threshold = HIGHSCORES[HIGHSCORES.length - 1].score;
        if (SCORE > threshold) {
            HIGHSCORES.pop();
            saveHighscore();
        } 

    }
    
}

let TIMER;
let MS = 0;
let SEC = 0;
let MIN = 0;

let letterCount, currentWord;
let WORDLIST;
let guessedLetters = [];

let POINTS = {
    SCORE: 0,
    letterStreak: 0,
    wordStreak: 0,
    currentPointWorth: 1000,
    pointWorth: function() {
        return this.currentPointWorth * ((this.letterStreak + 1)/2);
    }
}


function getWordLists() {
    if (localStorage.getItem('wordLists') !== null) {
        let listsString = localStorage.getItem('wordLists');
        wordLists = JSON.parse(listsString);
    } else {
        console.log('hi');
        wordLists = defaultWordList;
    }
    
}

function setup() {
    getWordLists(); // CHECK FOR CUSTOM LISTS
    
    // FIND AND SET DEFAULT LIST
    let lists = Object.keys(wordLists);
    for(let i = 0; i < lists.length; i++) {
        if(wordLists[`${lists[i]}`].default === true) {
            let defaultList = wordLists[`${lists[i]}`];
            colorSelect.innerHTML = defaultList.name;
            WORDLIST = defaultList.words;
        }
    }
    
    // CREATE LIST OPTIONS
    listChoices.innerHTML = '';
    for (const list in wordLists) {
        console.log(list);
        let choice = document.createElement('li');
        choice.setAttribute('data-key', `${list}`);
        choice.classList.add('wordlist-choice');
        choice.innerHTML = wordLists[`${list}`].name;
        console.log(wordLists[`${list}`].name);
        choice.addEventListener('click', chooseList);
        listChoices.appendChild(choice);
    }
}




setup();

function chooseList(e) {
    WORDLIST = wordLists[`${e.target.attributes[0].value}`].words;
    colorSelect.innerHTML = wordLists[`${e.target.attributes[0].value}`].name;
    categoryDisplay.innerHTML = wordLists[`${e.target.attributes[0].value}`].name;
    console.log(WORDLIST);
}

function startGame() {
    changeGameScreen('start', 'game');
    genWord();
}

function genWord(e) {
    
    let num = Math.floor(Math.random() * WORDLIST.length);
    currentWord = WORDLIST[num];
    guessedLetters = [];
    console.log(WORDLIST);
    let wordString = currentWord.split('');
    letterCount = wordString.length;
    word.innerHTML = '';
    for(let i = 0; i < wordString.length; i++) {
        let letter = document.createElement('div');
        letter.innerHTML = '&nbsp;';
        letter.classList.add('letter-space',`answer-${wordString[i]}`);
        word.appendChild(letter);
    }
    for(let i = 0; i < alphaLetters.length; i++) {
        alphaLetters[i].addEventListener('click', mouseGuess);
        alphaLetters[i].classList.remove('used');
    }
    startTimer();
}

document.onkeypress = function (e) {
    e = e || window.event;
    let unicode = e.keyCode;
    let char = String.fromCharCode(unicode);
    console.log(char);
    if (guessedLetters.includes(char) === false) {
        keyGuess(char);
    }
};

function keyGuess(char) {
    for(let i = 0; i < alphaLetters.length; i++) {
        if(alphaLetters[i].innerHTML === char) {
            let letter = alphaLetters[i];
            guessLetter(letter);
        }
    }
}

function mouseGuess(e) {
    let letter = e.target;
    if (guessedLetters.includes(e.target.innerHTML) === false) {
        guessLetter(letter);
    }
}

function guessLetter(letter) {
    guessedLetters.push(letter.innerHTML);
    console.log(guessedLetters);
    letter.classList.add('used');
    let matches = document.getElementsByClassName(`answer-${letter.innerHTML}`);
    letter.removeEventListener('click', guessLetter);
    console.log(matches[0]);
    if(matches[0] !== undefined) {
        for (let i = 0; i < matches.length; i++) {
            console.log('hi');
            matches[i].innerHTML = `${letter.innerHTML}`;
            letterCount--;
            POINTS.SCORE = POINTS.SCORE + POINTS.pointWorth();
            score.innerHTML = POINTS.SCORE;
            if(letterCount === 0) {
                winScore.innerHTML = POINTS.SCORE;
                winWord.innerHTML = currentWord;
                stopTimer();
                
                for(let i = 0; i < alphaLetters.length; i++) {
                    alphaLetters[i].classList.remove('used');
                    alphaLetters[i].addEventListener('click', guessLetter);
                }
                stopTimer();
                changeGameScreen('game', 'win');

            }
        }
    } else {
        return;
    }
}


function changeGameScreen(currentM, nextM) {
    if(nextM === 'start') {
        setup();
    }
    gameScreens[currentM].element.classList.add('hide');
    gameScreens[nextM].element.classList.remove('hide')
}


/*function changeGameScreen(currentM, nextM) {
    hideEle(currentM);
    setTimeout(() => {showEle(nextM)}, 500);
}

function hideEle(ele) {
    ele.addEventListener('transitionend', () => {ele.style.display = "none";});
    ele.classList.add('hide');
}

function showEle(ele) {
    ele.style.display = "flex";
    ele.classList.remove('hide');
}*/

function newWord() {
    guessedLetters = [];
    genWord();
    changeGameScreen('win', 'game');
}

/* --- TIMER --- */

function startTimer() {
    TIMER = setInterval(runTimer, 10);
    console.log(TIMER);
}

function stopTimer() {
    clearInterval(TIMER);
    console.log(TIMER);
}

function runTimer() {
    
    if (MS < 59) {
        MS++;
    } else if (SEC < 59) {
        MS = 0;
        SEC++;
        if (POINTS.pointWorth() === 100) {
            return;
        } else {
            POINTS.currentPointWorth = POINTS.currentPointWorth - 5;
        }
    } else if (MIN < 59) {
        MS = 0;
        SEC = 0;
        MIN++;
    }
    clock.innerHTML = `${pad(MIN)}:${pad(SEC)}:${pad(MS)}`;
}



function pad(num) {
    return num < 10 ? `0${num}` : num;
}


function resumeGame() {
    closeModal();
    modalHeader.removeChild(modalHeader.childNodes[3]);
    startTimer();
}


/* --- PAUSE --- */

function pauseGame() {
    console.log('pause');
    stopTimer();
    changeGameScreen('game', 'pause')
}

function resumeGame() {
    console.log('pause');
    startTimer();
    changeGameScreen('pause', 'game');
}


class CustomWordList {
    constructor(name, words) {
        this.name = name
        this.words = words
        this.highScores = []
        this.default = false
    }
}

const newWords = document.getElementById('new-words');
const newCategory = document.getElementById('new-cat');
const newWordList = document.getElementById('new-word-list');

function acceptWord(e) {
    console.log(e.target.parentElement);
    let ele = e.target.parentElement;
    ele.innerHTML = '<i class="far fa-trash-alt"></i>';
    ele.removeAttribute('onclick');
    ele.removeEventListener('click', acceptWord);
    ele.addEventListener('click', deleteWord);
    
    let newInputArea = document.createElement('li');
    newInputArea.classList.add('new-word');
    newWordList.appendChild(newInputArea);
    
    let addBtn = document.createElement('div');
    addBtn.classList.add(`icon`);
    addBtn.addEventListener('click', acceptWord);
    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
    newInputArea.appendChild(addBtn);
    
    let newInput = document.createElement('input');
    newInput.classList.add('edit-word');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('value', 'new word');
    newInputArea.insertBefore(newInput, newInputArea.childNodes[0]);
    
}

function deleteWord(e) {
    console.log(e.target.parentElement.parentElement);
    e.target.parentElement.parentElement.remove();
}

function createList() {
    
    console.log(newCategory.value);
    let newWordList = [];
    let eles = document.getElementsByClassName('edit-word');
    for(let i = 0; i < eles.length; i++) {
        console.log(eles[i].value);
        newWordList.push(eles[i].value);
    }
    
    wordLists[`${newCategory.value}`] = {
        name: newCategory.value,
        words: newWordList,
        highScores: [],
        default: false
    }
    
    localStorage.setItem('wordLists', `${JSON.stringify(wordLists)}`);
    
    console.log(wordLists);
    
   /* let newWordList = [];
    let eles = document.getElementsByClassName('edit-word');
    for(let i = 0; i < eles.length; i++) {
        console.log(eles[i].value);
        newWordList.push(eles[i].value);
    }
    let newList = new CustomWordList(newCategory.value, newWordList);
    console.log(newList);*/
    
}
 





