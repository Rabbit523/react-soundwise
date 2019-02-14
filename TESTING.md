# Testing

Notes and some useful tips for testing

## General tips

If you sign up for new account, please use a REAL email address

If you create new soundcasts for testing, please set `published = false` in firebase

## Account

To obtain user's **id** run (in browser console):
```
firebase.auth().currentUser.uid
```

To delete already existing account you need to relogin (in browser) and run:
```
firebase.auth().currentUser.delete().then(() => console.log('Success')).catch(error => console.error(error));
```

To set up *PLUS* account:
- find **PUBLISHER_ID** from *users/{USER_ID}/publisherID*
- set *beta:true* value for publisher (*publishers/{PUBLISHER_ID}/beta*)

## Testing soundcasts

http://localhost:3000/soundcasts/1512247726161s - single (with available coupon code *tryitfree*)
http://localhost:3000/soundcasts/1519180882673s - bundle

## Testing signup_options

Uncomment/set test *publisherEmail* (if needed) in **parseFeed.js:getPublisherEmail** function, example:
```
  // return 'YOUR_TEST@EMAIL.COM'; // set test publisher email
```

#### To delete all feed related data
```
cd ./server/scripts
SET_TEST_FEED=delete NODE_ENV=dev node setTestFeed.js
```

#### To import feed

- Open http://localhost:3000/signup_options and set test feed url:
>http://download.omroep.nl/avro/podcast/klassiek/zoc/rssZOC.xml

\*(another url could be *http://foundersnextdoor.com/feed/podcast/*)

- Submit code
- After jumping to *dashboards* view - wait till **Importing feed** process complete

#### To reset all feed data
```
cd ./server/scripts
SET_TEST_FEED=reset NODE_ENV=dev node setTestFeed.js
```

\- this should bring rows to original (not claimed) state (for this particular feed)

#### Tables expected to be changed:

Postgres:
>Soundcasts, ImportedFeeds, PodcasterEmails, Categories, Episodes

Firebase:
>users (new user), publishers (new publisher), soundcasts, episodes

Original (not claimed) feeds should have:
- **publisherEmail**: empty or 'null' (string) if no email was found in feed metadata
- **userId**: 'Soundcast_userId_iTunesUrls' (string)

## Stripe

You can test new user checkout with a test credit card number 4242424242424242.

Expiration date must be in future. CVC code can be any three digits.

Test stripe_id:

*cus_Ce5IdSGT4Bs1br* (- *users/${USER_ID}/stripe_id* fb node)


Test stripe_id for payouts:

*acct_1BZSpfI4Klp9ZG1K* (- *publishers/${USER_ID}/stripe_user_id* fb node)*

\* - Note: comment *inviteListeners* call in *app_signup.js* (other files?)

