'use strict';

const verification = require('./verification').getVerificationSync();
const app = require('actions-on-google').dialogflow(verification);

const CONTEXT_QUIZ = 'quiz';
const CONTEXT_QUIZ_NUMBER = 'quiz_number';

let quizData = {};
let quizNum = 0;

// クイズを出題する
const quiz = conv => {
    doQuiz(conv);
}

const quizAnswer = (conv, params) => {
    // ItemNameパラメータを受け取る
    const itemName = params.ItemName;

    if (!quizData) {
        conv.close('クイズを始めるには「クイズ」と言ってください。');
        return;
    }

    const correctAnswer = quizData.answer;
    let reply = '<speak>';
    if (correctAnswer === itemName) {
        reply += '<emphasis level="strong">正解です！</emphasis>';
    } else {
        reply += '違います。正解は「' + correctAnswer + '」でした。';
    }
    reply += '</speak><break time="1000ms"/>';
    conv.ask(reply);

    doQuiz(conv);
}

const quizRepeat = conv => {
    conv.ask('<speak>まるまる<break time="500ms"/>にあてはまる言葉を答えてください。<break time="500ms"/>'
        + quizData.question
        + '</speak>');
}

const quizContinue = conv => conv.ask('続けますか？');

// Intentの設定
app.intent('Default Welcome Intent', quiz);
app.intent('Quiz', quiz);
//app.intent('QuizAnswer - yes', quiz);
app.intent('QuizAnswer', quizAnswer);
app.intent('Quiz - repeat', quizRepeat);
app.intent('Quiz - noinput', quizRepeat);
app.intent('QuizAnswer - noinput', quizContinue);

function doQuiz(conv) {
    quizData = require('./history-quiz').create();
    quizNum++;

    // コンテキストにデータを保存
    // conv.contexts.set(CONTEXT_QUIZ, 1, { quiz: quiz, });
    // let quizNumber = getQuizNumber(conv);

    conv.ask('<speak>第' + quizNum + '問<break time="100ms" />'
        + 'まるまる <break time="500ms" /> にあてはまる言葉を答えてください。<break time="500ms" />'
        + quizData.question
        + '</speak>');
}

// // コンテキストに保存されたクイズデータを取得
// function getQuizFromContext(conv) {
//     const context = conv.contexts.get(CONTEXT_QUIZ);
//     return context ? context.parameters.quiz : null;
// }

// function getQuizNumber(conv) {
//     let context = conv.contexts.get(CONTEXT_QUIZ_NUMBER);
//     let quizNumber = 0;
//     if (context) {
//         quizNumber = context.number;
//         console.log("QuizNumber - context: " + context.number);
//     }
//     console.log("QuizNumber: " + quizNumber);
//     conv.contexts.set(CONTEXT_QUIZ_NUMBER, 10, { number: ++quizNumber, });

//     return quizNumber ? quizNumber : 1;
// }

module.exports = app;