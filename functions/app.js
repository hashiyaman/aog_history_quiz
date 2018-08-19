'use strict';

const verification = require('./verification').getVerificationSync();
const app = require('actions-on-google').dialogflow(verification);

const sprintf = require('sprintf-js').sprintf;

const NUMBER_OF_QUIZZES = 3;
const MESSAGE_QUESTION = '<speak> 第%d問<break time="100ms" />まるまる <break time="500ms" /> にあてはまる言葉を答えてください。<break time="500ms" />%s</speak>';
const MESSAGE_RESULT = '<speak> これでクイズは終わりです。<break time="100ms" />あなたの正解率は<break time="500ms" />%.3fです<break time="500ms" />%s</speak>';

let quizData = {};
let quizNumber = 0;
let numberOfCorrectAnswer = 0;

const quizAnswer = (conv, params) => {
    const itemName = params.ItemName;

    if (!quizData) {
        conv.close('歴史クイズを始めるには「歴史クイズ」と言ってください。');
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
    quizData = require('./history-quiz').create();
    quizNumber++;

    if (quizNumber <= NUMBER_OF_QUIZZES) {
        quizDo(conv);
    } else {
        const correctRatio = (numberOfCorrectAnswer / NUMBER_OF_QUIZZES);
        const evaluationMessage = getEvaluationMessage(correctRatio);
        conv.ask(sprintf(MESSAGE_RESULT, correctRatio, evaluationMessage));

        quizContinue(conv);
    }
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
        evaluationMessage += "すごい、歴史マスターですね！";
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