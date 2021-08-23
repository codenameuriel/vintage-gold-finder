import * as ChromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import axios from 'axios';
import { createImportSpecifier } from 'typescript';

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

    // allow page unlimited time to load
    await page.setDefaultNavigationTimeout(0);

    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1
    });

    await page.goto('https://etsy.com/search/vintage?q=gold+jewelry');

    const productLinks = await page.$$eval(
      'div[class~=search-listing-card--desktop] > a.listing-link',
      (aTags) => aTags.map((aTag) => (aTag as HTMLAnchorElement).href)
    );

    // filter out the '?version=[0-9]' characters from the end of the string
    const productImages = await page.$$eval(
      'img[data-listing-card-listing-image]',
      (imgTags) =>
        imgTags.map(
          (imgTag) =>
            (imgTag as HTMLImageElement).src.split(/\?version=[0-9]\b/)[0]
        )
    );

    const productNames = await page.$$eval(
      'div[class^="v2-listing-card__info"] > div > h3',
      (h3Tags) => h3Tags.map((h3Tag) => (h3Tag as HTMLHeadingElement).innerText)
    );

    // use css 'or' operator to select either available span element
    const productPrices = await page.$$eval(
      'p.wt-text-title-01 > span[aria-hidden="true"] > span.currency-value, p.wt-text-title-01 > span.currency-value',
      (spanTags) =>
        spanTags.map((spanTag) => (spanTag as HTMLSpanElement).innerText)
    );

    // await browser.close();
    // await chrome.kill();
  } catch (err) {
    console.error(err);
  }
};

init();
