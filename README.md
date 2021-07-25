# Arabic-Bites

Concept

- A twitter account that injects user-submitted simple phrases onto your twitter TL.

Flow

- User DMs the bot. The bot sends instructions and greets the user.
- The bot checks sign up date and makes sure account is more than a week old.
- The bot checks that the user follows it.
- The bot scans the message for “” in order to find locate the arabic.
  - The bot ensures the text is Arabic
  - The bot adds the text into a sqlite document
- Every 10 minutes, the bot checks the db.
- If there is a tweet, it retrieves it from the db, deletes it, then tweets.
