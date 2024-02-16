const puppeteer = require('puppeteer'); 
const path = require('path');

async function scrapeTwitter() {
  const userDataDir = path.join(__dirname, 'session_dir');
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: userDataDir,
  });
  const page = await browser.newPage();

  const topicToSearch = 'Prabowo';
  await page.goto(`https://x.com/search?q=${topicToSearch}&src=typed_query&`);
  await page.waitForSelector('section[aria-labelledby="accessible-list-0"]');
  await page.evaluate('window.scrollTo(0, 1000)');
  await page.waitForSelector('div[data-testid="tweetText"]');

  let scrollAmount = 10000;
  let allTweets = [];
  let prevHeight = 1000;
  while (scrollAmount !== 0) {
    await page.evaluate(`window.scrollTo(${prevHeight}, ${prevHeight+1000})`);
    await page.waitForSelector('div[data-testid="tweetText"]');
    const listers = await page.evaluate(async() => {
        const selectedSection = document.querySelector('section[aria-labelledby="accessible-list-0"]');
        const sectionIter = selectedSection.children[1].children[0].children;
        let sectionIterList = [];
        for (let i = 0; i < sectionIter.length; i++) {
            const iter = sectionIter[i].querySelector('div[data-testid="tweetText"]');
            if (iter !== null) { sectionIterList.push(iter.textContent); }
        }
        return sectionIterList;
    });
    allTweets = allTweets.concat(listers);
    prevHeight += 1000;
    scrollAmount -= 1;
  }
  const unduplicatedTweets = new Set(allTweets);
  const toArray = Array.from(unduplicatedTweets);
  for (let j = 0; j < toArray.length; j++) {
    console.log(`Tweet Number ${j} ${toArray[j]}`);
  }
}

scrapeTwitter();