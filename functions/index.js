'use strict';

const fs = require('fs');
const path = require('path');

const FILE_PASSWD = path.join(__dirname, 'passwd');

// 以下をコメントアウトするとデバッグ出力が有効になります
process.env.DEBUG = 'actions-on-google:*';

const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');

let verification = {};
fs.readFile(FILE_PASSWD, function (err, data) {
  verification = {
    verification: {
      Authorization: 'Bearer ' + data,
    },
  }
})

const app = dialogflow(verification);

const CONTEXT_QUIZ = 'quiz';
const CONTEXT_QUIZ_NUMBER  = 'quiz_number';

// Intentの設定
app.intent('Default Welcome Intent', quiz);
app.intent('Quiz', quiz);
//app.intent('QuizAnswer - yes', quiz);
app.intent('QuizAnswer', quizAnswer);
app.intent('Quiz - repeat', quizRepeat);
app.intent('Quiz - noinput', quizRepeat);
app.intent('QuizAnswer - noinput', conv => {
  conv.ask('もう一回、やりませんか？');
});

// クイズを出題する
function quiz(conv, params, input) {
  const quiz = require('./history-quiz').create();

  // コンテキストにデータを保存
  conv.contexts.set(CONTEXT_QUIZ, 1, { quiz: quiz, });
  
  let quizNumber = getQuizNumber(conv);
  conv.ask('<speak>第' + quizNumber + '問<break time="100ms"/>');

  conv.ask('<speak>まるまる<break time="500ms"/>にあてはまる言葉を答えてください。' +
    '<break time="500ms"/>' +
    quiz.question + '</speak>');
}

function quizAnswer(conv, params, input) {
  // ItemNameパラメータを受け取る
  const itemName = params.ItemName;

  const quiz = getQuizFromContext(conv);
  if (!quiz) {
    // クイズデータがない
    conv.close('クイズを始めるには「クイズ」と言ってください。');
    return;
  }

  const correctAnswer = quiz.answer;
  let reply = '<speak>';
  if (correctAnswer === itemName) {
    reply += '<emphasis level="strong">正解です！</emphasis>';
  } else {
    reply += '違います。正解は「' + correctAnswer + '」でした。';
  }

  conv.ask(reply);
  quiz(conv, params, input);
}

// コンテキストに保存されたクイズデータを取得
function getQuizFromContext(conv) {
  const context = conv.contexts.get(CONTEXT_QUIZ);
  return context ? context.parameters.quiz : null;
}

function getQuizNumber(conv) {
  let context = conv.contexts.get(CONTEXT_QUIZ_NUMBER);
  let quizNumber = 0;
  if (context) {
    quizNumber = context.number;
  }
  conv.contexts.set(CONTEXT_QUIZ_NUMBER, 10, {number: ++quizNumber, });

  return quizNumber ? quizNumber : 1;
}

// 問題文を繰り返す
function quizRepeat(conv, params, input) {
  const quiz = getQuizFromContext(conv);

  conv.ask('<speak>まるまる<break time="500ms"/>にあてはまる言葉を答えてください。' +
           '<break time="500ms"/>' +
           quiz.question + '</speak>');
}

// quizという関数名でエクスポート
exports.quiz = functions.https.onRequest(app);
