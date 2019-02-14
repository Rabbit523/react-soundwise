//* Test suite example:
//  github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/example/google_search_test.js
// const { Browser, Builder, By, Key, until } = require('selenium-webdriver');
const { Builder, By, until } = require('selenium-webdriver');
const firebase = require('firebase-admin');
const { serviceAccount, awsConfig } = require('./serviceAccountKey.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://soundwise-a8e6f.firebaseio.com',
});
const AWS = require('aws-sdk');
AWS.config.update(awsConfig);
const s3 = new AWS.S3();

// Remove user plus all testing data
const clearTestData = async () => {
  try {
    const snapshot = await firebase
      .database()
      .ref('users')
      .orderByChild('firstName')
      .equalTo('FirstNameTest')
      .once('value');
    const snapshotVal = snapshot.val(); // { USER_ID : {...} }
    if (snapshotVal) {
      const userId = Object.keys(snapshotVal)[0];
      const user = snapshotVal[userId];
      if (user.soundcasts_managed) {
        const soundcastIds = Object.keys(user.soundcasts_managed);
        for (const soundcastId of soundcastIds) {
          const episodesSnapshot = await firebase
            .database()
            .ref(`soundcasts/${soundcastId}/episodes`)
            .once('value');
          const episodeIds = Object.keys(episodesSnapshot.val() || {});
          for (const episodeId of episodeIds) {
            console.log(`Deleting episode ${episodeId}`);
            await firebase
              .database()
              .ref(`episodes/${episodeId}`)
              .remove();
            const options = { Bucket: 'soundwiseinc', Key: `soundcasts/${episodeId}.mp3` };
            s3.deleteObject(options, () => 0);
          }
          console.log(`Deleting soundcast ${soundcastId}`);
          await firebase
            .database()
            .ref(`soundcasts/${soundcastId}`)
            .remove();
        }
      }
      if (user.soundcasts) {
        // unsubscribe from soundcasts
        const soundcastIds = Object.keys(user.soundcasts);
        for (const soundcastId of soundcastIds) {
          await firebase
            .database()
            .ref(`soundcasts/${soundcastId}/subscribed/${userId}`)
            .remove();
        }
      }
      if (user.publisherID) {
        await firebase
          .database()
          .ref(`publishers/${user.publisherID}`)
          .remove();
      }

      // clear subscribed count
      await firebase
        .database()
        .ref(`soundcasts/1508293913676s/subscribed/${userId}`)
        .remove();
      await firebase
        .database()
        .ref(`soundcasts/1526158128140s/subscribed/${userId}`)
        .remove();

      // remove user
      await firebase
        .database()
        .ref(`users/${userId}`)
        .remove();
      await firebase.auth().deleteUser(userId);
    }
  } catch (err) {
    console.log(`Error: clearTestData ${err}`);
  }
};

// Time delay coefficient
const delayCoefficient = process.env.DELAY ? Number(process.env.DELAY) : 1;
const setDelay = delayMicroseconds =>
  new Promise(resolve => setTimeout(resolve, delayMicroseconds * delayCoefficient));

const runTest = async () => {
  let driver, alertText;
  const hostUrl =
    process.env.HOST_URL ||
    (process.env.MAC ? 'http://host.docker.internal:3000' : 'http://172.17.0.1:3000');
  const email = 'ivanm376test3@gmail.com';
  const soundwiseTitle = `Soundwise: #1 Mobile-Centric Platform For Selling & Delivering On-Demand Audios`;
  try {
    console.log(`1. sign up for a free soundcast`);
    await clearTestData();
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get(`${hostUrl}/soundcasts/1508293913676s`); // free
    await setDelay(6000);
    await driver.findElement(By.id('getAccessBtnTest')).click();
    await setDelay(2000);
    await driver.findElement(By.css('input[placeholder="First name"]')).sendKeys('FirstNameTest');
    await driver.findElement(By.css('input[placeholder="Last name"]')).sendKeys('LastNameTest');
    await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(email);
    await driver.findElement(By.css('input[placeholder="Password"]')).sendKeys('123123');
    await driver.findElement(By.id('getAccessBtnTest2')).click();
    await driver.wait(until.titleIs(soundwiseTitle), 20000);
    await driver.wait(until.urlContains('/notice'), 20000);
    await setDelay(1000);
    await driver.quit();

    console.log(`2. sign up for a paid soundcast`);
    driver = await new Builder().forBrowser('chrome').build();
    await clearTestData();
    await driver.get(`${hostUrl}/soundcasts/1526158128140s`); // single price
    await setDelay(8000);
    await driver.findElement(By.id('getAccessBtnTest')).click();
    await setDelay(2000);
    await driver.findElement(By.css('input[placeholder="First Name"]')).sendKeys('FirstNameTest');
    await driver.findElement(By.css('input[placeholder="Last Name"]')).sendKeys('LastNameTest');
    await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(email);
    await driver
      .findElement(By.css('input[placeholder="Card Number"]'))
      .sendKeys('4242424242424242');
    await driver.findElement(By.css('select[name="exp_year"]')).sendKeys('2028');
    await driver.findElement(By.css('input[placeholder="CVC"]')).sendKeys('123');
    await driver.findElement(By.id('paymentPayNowBtnTest')).click();
    await driver.wait(until.titleIs(soundwiseTitle), 20000);
    await driver.wait(until.urlContains('/soundcast_checkout'), 20000);
    await setDelay(12000);
    await driver.findElement(By.css('input[placeholder="Password"]')).sendKeys('123123');
    await driver.findElement(By.id('signInSoundcastCheckoutBtnTest')).click();
    await driver.wait(until.titleIs(soundwiseTitle), 20000);
    await driver.wait(until.urlContains('/notice'), 20000);
    await setDelay(1000);
    await driver.quit();

    console.log(`3. pay and create a new publisher account`);
    driver = await new Builder().forBrowser('chrome').build();
    await clearTestData();
    await driver.get(`${hostUrl}/pricing`);
    await driver.findElement(By.id('pricingGetPlusBtnTest')).click();
    await driver.wait(until.urlContains('/buy'), 20000);
    await setDelay(2000);
    await driver.findElement(By.css('input[placeholder="Email address"]')).sendKeys(email);
    await driver
      .findElement(By.css('input[placeholder="Card Number"]'))
      .sendKeys('4242424242424242');
    await driver.findElement(By.css('select[name="exp_year"]')).sendKeys('2028');
    await driver.findElement(By.css('input[placeholder="CVC"]')).sendKeys('123');
    await driver.findElement(By.id('buyPayNowBtnTest')).click();
    await setDelay(6000);
    alertText = await driver
      .switchTo()
      .alert()
      .getText();
    if (alertText !== `You've been upgraded to the PLUS plan!`) {
      throw 'Error: Step 3 pay and create a new publisher account incorrect alert message';
    }
    await driver
      .switchTo()
      .alert()
      .accept();
    await setDelay(1000);
    await driver.findElement(By.id('signupOptionsNewPodcastBtnTest')).click();
    await driver.wait(until.urlContains('/signup/admin'), 20000);
    await setDelay(2000);
    await driver.findElement(By.css('input[placeholder="First name"]')).sendKeys('FirstNameTest');
    await driver.findElement(By.css('input[placeholder="Last name"]')).sendKeys('LastNameTest');
    await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(email);
    await driver.findElement(By.css('input[placeholder="Password"]')).sendKeys('123123');
    await driver.findElement(By.id('signupNextBtnTest')).click();
    await setDelay(5000);
    await driver
      .findElement(By.css('input[placeholder="Publisher name"]'))
      .sendKeys('PublisherNameTest');
    await driver.findElement(By.id('signupCreateAccBtnTest')).click();
    await driver.wait(until.titleIs(soundwiseTitle), 20000);
    await setDelay(5000);

    // // "Sign in" example
    // await driver.get(`${hostUrl}/signin`);
    // await setDelay(3000);
    // await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(email);
    // await driver.findElement(By.css('input[placeholder="Password"]')).sendKeys('123123');
    // await driver.findElement(By.id('appSigninBtnTest')).click();
    // await setDelay(3000);

    console.log(`4. create a new soundcast`);
    await driver.wait(until.urlContains('/dashboard/soundcasts'), 20000);
    await setDelay(1000);
    await driver.findElement(By.id('addNewSoundcastBtnTest')).click();
    await setDelay(1000);
    await driver.findElement(By.id('startNewSoundcastFromScratchBtnTest')).click();
    await driver.wait(until.urlContains('/dashboard/add_soundcast'), 20000);
    await driver
      .findElement(By.css('input[placeholder="Soundcast title"]'))
      .sendKeys('SoundcastTitleTest');
    await driver
      .findElement(By.css('textarea[placeholder="A short description of this soundcast"]'))
      .sendKeys('A short description of this soundcast');
    await driver.findElement(By.id('addSoundcastChooseCategoryBtnTest')).click();
    await driver.findElement(By.css('.categoriesMenuTest > li:first-child > button')).click();
    await driver.executeScript('window.scrollTo(0, 2000)'); // scroll down
    await setDelay(2000);
    await driver.findElement(By.id('saveDraftSoundcastBtnTest')).click();
    await setDelay(5000);
    alertText = await driver
      .switchTo()
      .alert()
      .getText();
    if (alertText !== 'New soundcast created.') {
      throw 'Error: Step 4 create new soundcast incorrect alert message';
    }
    await driver
      .switchTo()
      .alert()
      .accept();
    await setDelay(1000);

    console.log(`5. create a new episode`);
    await driver.findElement(By.id('dashboardMenuAddEpisodeTestBtn')).click();
    await setDelay(2000);
    await driver.findElement(By.css('input[placeholder="Title*"]')).sendKeys('EpisodeTitleTest');
    await driver
      .findElement(By.id('upload_hidden_audio'))
      .sendKeys('/home/seluser/tests-selenium/testfile.mp3');
    await setDelay(6000);
    await driver.findElement(By.id('createEpisodeSaveDraftTestBtn')).click();
    await setDelay(3000);
    alertText = await driver
      .switchTo()
      .alert()
      .getText();
    if (alertText !== 'Episode saved') {
      throw 'Error: Step 5 create new episode incorrect alert message';
    }
    await driver
      .switchTo()
      .alert()
      .accept();
    await setDelay(1000);
    await driver.quit();
    await clearTestData();
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  try {
    if (driver) {
      await driver.quit();
    }
  } catch (err) {}
  setTimeout(() => process.exit(), 2000);
};
runTest();
