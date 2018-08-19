'use strict';

const verification = require('./verification').getVerificationSync();
const app = require('actions-on-google').dialogflow(verification);

const CONTEXT_QUIZ = 'quiz';
const CONTEXT_QUIZ_NUMBER = 'quiz_number';

let quizData = {};
let quizNum = 0;

const quiz = conv => {
    doQuiz(conv);
}

const quizAnswer = (conv, params) => {
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
    reply += '<break time="1000ms"/></speak>';
    conv.ask(reply);

    doQuiz(conv);
}

function doQuiz(conv) {
    quizData = require('./history-quiz').create();
    quizNum++;

    conv.ask('<speak>第' + quizNum + '問<break time="100ms" />'
        + 'まるまる <break time="500ms" /> にあてはまる言葉を答えてください。<break time="500ms" />'
        + quizData.question
        + '</speak>');
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

module.exports = app;