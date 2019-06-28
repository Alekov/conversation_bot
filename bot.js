process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require ('node-telegram-bot-api');

// bot settings
const config = require ('./config/config');
const token = config.telegram.token;

const bot = new TelegramBot (token, {polling: {interval: 1000}});

// dialogFlow settings
const dialogflow = require ('dialogflow').v2beta1;
const uuid = require ('uuid');

const projectId = 'small-talk-1-hxwyys';
const sessionId = uuid.v4 ();

const sessionClient = new dialogflow.SessionsClient ();
const sessionPath = sessionClient.sessionPath (projectId, sessionId);

bot.onText (/.*/, function (msg, match) {
    if (msg.from.id === msg.chat.id) {
        const trimmedText = msg.text.trim ();

        if ((trimmedText[0] === "/") && (trimmedText.indexOf (" ") === -1)) {
            // bot commands
            switch (trimmedText) {
                case "/start":
                    bot.sendMessage (msg.from.id, `Привет!`, {
                        reply_markup: JSON.stringify ({
                            remove_keyboard: true
                        })
                    });
                    break;
                default:
                    bot.sendMessage (msg.from.id, `Не знаю такой команды`, {
                        reply_markup: JSON.stringify ({
                            remove_keyboard: true
                        })
                    });
                    break;
            }
        } else {
            // user input
            switch (trimmedText) {
                default:
                    const request = {
                        session: sessionPath,
                        queryInput: {
                            text: {
                                text: trimmedText,
                                languageCode: 'ru-RU',
                            }
                        }
                    };

                    bot.sendChatAction (msg.from.id, 'typing', {})
                        .then (() => {
                            sessionClient
                                .detectIntent (request)
                                .then ((response) => {

                                    // console.log(response); // full response

                                    const result = response[0].queryResult;

                                    console.log ('Detected intent');
                                    console.log (`  Query: ${result.queryText}`);
                                    console.log (`  Response: ${result.fulfillmentText}`);

                                    if (result.intent) {
                                        console.log (`  Intent: ${result.intent.displayName}`);
                                        bot.sendMessage (msg.from.id, response[0].queryResult.fulfillmentText, {
                                            reply_markup: JSON.stringify ({
                                                remove_keyboard: true
                                            })
                                        });
                                    } else {
                                        console.log (`  No intent matched.`);
                                        bot.sendMessage (msg.from.id, `Не знаю что ответить`, {
                                            reply_markup: JSON.stringify ({
                                                remove_keyboard: true
                                            })
                                        });
                                    }
                                }).catch ((err) => { console.log (err); });
                        }).catch ((err) => { console.log (err); });
                    break;
            }
        }
    }
});