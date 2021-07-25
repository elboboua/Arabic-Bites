const Twitter = require("twit");
const { TwitThread } = require("twit-thread");
require("dotenv").config();

let twitConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

const client = new Twitter(twitConfig);
const threadClient = new TwitThread(twitConfig);

// client.post(
//   "statuses/update",
//   { status: "I Love Twitter" },
//   function (error, tweet, response) {
//     if (error) throw error;
//     console.log(tweet); // Tweet body.
//   }
// );

client.get(
  "direct_messages/events/list",
  async function (error, tweets, response) {
    if (error) throw error;
    let event;
    for (let i = 0; i < tweets.events.length; i++) {
      event = tweets.events[i];
      if (event.type == "message_create") {
        if (event.message_create.target.recipient_id == "1216530960176615429") {
          // this message is directed at me
          let response = "";

          // scan the message for quotations.
          let message = event.message_create.message_data.text;
          let regex = message.match(/"([^']+)"/);
          if (regex != null) {
            // There is a quote
            let proposedTweet = regex[1];
            let userInfo = {};
            // get user info
            client.get(
              "users/lookup",
              { user_id: event.message_create.sender_id },
              async (error, data, response) => {
                userInfo.screen_name = data[0].screen_name;
                userInfo.followers_count = data[0].followers_count;

                // check that user has enough followers (> 25)
                console.log(userInfo);
                if (userInfo.followers_count > 25) {
                  // Store tweet in db to be retrieved / send tweet
                  await threadClient.tweetThread([
                    { text: proposedTweet },
                    {
                      text: `Uploaded by @${userInfo.screen_name}.\nContact @AhmadIbnRachid about issues.`,
                    },
                  ]);
                  response =
                    "Thanks for submitting a tweet! You're helping people learn Arabic!";
                } else {
                  // not enough followers
                  // send message to indicate
                  response =
                    "You don't have quite enough followers to give this service a try. I'm sorry :(";
                }
              }
            );
          } else {
            // If there is no quote, send a message greeting
            response =
              'Thanks for messaging Arabic Bites! To submit a sentence in Arabic, please include the submission in between double quotes. For example: "سلام"';
          }
          // send response
          console.log("sending a message");
          client.post(
            "direct_messages/events/new",
            {
              event: {
                type: "message_create",
                message_create: {
                  target: {
                    recipient_id: event.message_create.sender_id,
                  },
                  message_data: { text: `${response}` },
                },
              },
            },
            function (error, tweets, response) {
              if (error) console.log(error);
              else console.log(tweets);
            }
          );
        } else {
          // this is a message I sent
          console.log("I send a message");
        }
        // delete message
        client.delete(
          "direct_messages/events/destroy",
          { id: event.id },
          (err, data, response) => {
            if (error) console.log(error);
            else console.log(data);
          }
        );
      }
    }
  }
);
