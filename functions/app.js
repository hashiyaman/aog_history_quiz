'use strict';

const verification = require('./verification').getVerificationSync();
const app = require('actions-on-google').dialogflow(verification);

const sprintf = require('sprintf-js').sprintf;

const NUMBER_OF_QUIZZES = 10;
const MESSAGE_QUESTION = '<speak>第%d問 <break time="500ms" />%s</speak>';
const MESSAGE_RESULT = '<speak> これでクイズは終わりです。<break time="100ms" />'
    + 'あなたの正解率は<break time="500ms" />%.2fパーセントです。<break time="500ms" />'
    + '%s</speak> ';

const CONTEXT_QUIZ_ANSWER_FOLLOWUP = "QuizAnswer-followup-2";

let quizData = {};
let quizNumber = 1;
let numberOfCorrectAnswer = 0;

const quizAnswer = (conv, params) => {
    const itemName = params.ItemName;

    if (!quizData) {
        conv.close('クイズを始めるには「クイズ」と言ってください。');
        return;
    }

    const correctAnswer = quizData.answer;
    let reply = '<speak>';
    if (correctAnswer === itemName) {
        numberOfCorrectAnswer++;
        reply += '<emphasis level="strong">正解です！</emphasis>';
    } else {
        reply += '違います。正解は「' + correctAnswer + '」でした。';
    }
    reply += '<break time="1000ms"/></speak>';
    conv.ask(reply);

    quiz(conv);
}

const quiz = conv => {
    quizData = require('./quiz').create();

    if (quizNumber <= NUMBER_OF_QUIZZES) {
        quizDo(conv);
    } else {
        const correctRatio = Math.round((numberOfCorrectAnswer / NUMBER_OF_QUIZZES) * 100);
        const evaluationMessage = getEvaluationMessage(correctRatio);
        conv.ask(sprintf(MESSAGE_RESULT, correctRatio, evaluationMessage));

        conv.contexts.set(CONTEXT_QUIZ_ANSWER_FOLLOWUP, 1);
        quizNumber = 1;
        numberOfCorrectAnswer = 0;
    }

    quizNumber++;
}

function getEvaluationMessage(correctRatio) {
    let evaluationMessage = "<speak>";
    if (0 <= correctRatio && correctRatio < 20) {
        evaluationMessage += "苦手な分野でしたか？　もう少し頑張りましょう。";
    } else if (20 <= correctRatio && correctRatio < 40) {
        evaluationMessage += "まだまだ、覚えていないことがたくさんあるようです。";
    } else if (40 <= correctRatio && correctRatio < 60) {
        evaluationMessage += "もう一息ですね。頑張れ！";
    } else if (60 <= correctRatio && correctRatio < 80) {
        evaluationMessage += "かなり頑張りました。その調子です。";
    } else if (80 <= correctRatio && correctRatio < 100) {
        evaluationMessage += "惜しい、あとちょっとで満点ですね！";
    } else if (correctRatio == 100) {
        evaluationMessage += "すごい、社会マスターですね！";
    }
    evaluationMessage += "</speak>"
    return evaluationMessage;
}

const quizDo = conv => conv.ask(sprintf(MESSAGE_QUESTION, quizNumber, quizData.question));

const quizContinue = conv => conv.ask('もう一度、やりますか？');

// Intentの設定
app.intent('Default Welcome Intent', quiz);
app.intent('Quiz', quiz);
app.intent('QuizAnswer - yes', quiz);
app.intent('QuizAnswer', quizAnswer);
app.intent('Quiz - repeat', quizDo);
app.intent('Quiz - noinput', quizDo);
app.intent('QuizAnswer - noinput', quizContinue);

module.exports = app;