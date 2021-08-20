import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import axios from 'axios';

const init = async () => {
  try {
    const chrome = await ChromeLauncher.launch({
      chromeFlags: ['--headless']
    });
    const response = await axios.get(
      `http://localhost:${chrome.port}/json/version`
    );
    const { webSocketDebuggerUrl } = response.data;

    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl
    });
    const isConnected = browser.isConnected();
    isConnected && console.log('Connected to browser...');

    const page = await browser.newPage();

    await page.goto('https://etsy.com/search/vintage?q=gold+jewelry');

    const aTagHrefs = await page.$$eval('a.listing-link', aTags =>
      aTags.map(aTag => (aTag as HTMLAnchorElement).href)
    );
    // console.log(aTagHrefs, aTagHrefs.length);

    // filter out the '?version=[0-9]' characters from the end of the string
    const imgTagSources = await page.$$eval('img[data-listing-card-listing-image]', imgTags =>
      imgTags.map(imgTag => (imgTag as HTMLImageElement).src.split(/\?version=[0-9]\b/)[0])
    );
    // console.log(imgTagSources, imgTagSources.length);

    const h3TagInnerTexts = await page.$$eval('div[class^="v2-listing-card__info"] > div > h3', h3Tags => 
      h3Tags.map(h3Tag => (h3Tag as HTMLHeadingElement).innerText)
    );
    // console.log(h3TagInnerTexts, h3TagInnerTexts.length);

    await browser.close();
    await chrome.kill();
  } catch (err) {
    console.error(err);
  }
};

init();
