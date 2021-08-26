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
    const pages = await browser.pages();

    // close default blank about page
    pages[0].close();

    // allow page unlimited time to load
    // await page.setDefaultNavigationTimeout(0);

    await page.setViewport({
      width: 1200,
      height: 1200,
      deviceScaleFactor: 1
    });

    page.goto('https://etsy.com/search/vintage?q=gold+jewelry');

    await page.waitForNavigation();

    const productLinks = await page.$$eval(
      'div[class~=search-listing-card--desktop] > a.listing-link',
      (aTags) => aTags.map((aTag) => (aTag as HTMLAnchorElement).href)
    );
    // console.log(productLinks, productLinks.length)

    // filter out the '?version=[0-9]' characters from the end of the string
    const productImages = await page.$$eval(
      'img[data-listing-card-listing-image]',
      (imgTags) =>
        imgTags.map(
          (imgTag) =>
            (imgTag as HTMLImageElement).src.split(/\?version=[0-9]\b/)[0]
        )
    );
    // console.log(productImages, productImages.length)

    const productNames = await page.$$eval(
      'div[class^="v2-listing-card__info"] > div > h3',
      (h3Tags) => h3Tags.map((h3Tag) => (h3Tag as HTMLHeadingElement).innerText)
    );
    // console.log(productNames, productNames.length)

    // use css 'or' operator to select either available span element
    const productPrices = await page.$$eval(
      'p.wt-text-title-01 > span[aria-hidden="true"] > span.currency-value, p.wt-text-title-01 > span.currency-value',
      (spanTags) =>
        spanTags.map((spanTag) => (spanTag as HTMLSpanElement).innerText)
    );
    // console.log(productPrices, productPrices.length);

    const productDetails: string[][] = [];

    // TESTING
    for (let link of productLinks) {
      const productPage = await browser.newPage();
      productPage.goto(link);
      await productPage.waitForNavigation();
      const pages = await browser.pages();
      let detail = await pages[pages.length - 1].$$eval(
        'ul[class^="wt-text-body-01"] > li > div.wt-ml-xs-2, ul[class^="wt-text-body-01"] > li > div',
        (divs) => divs.map((d) => (d as HTMLDivElement).innerText)
      );
      // remove empty strings
      detail = detail.filter(text => !!text);
      productDetails.push(detail);
      productPage.close();
    }

    // console.log('total product links:', productLinks.length);
    console.log(productDetails, productDetails.length);

    await browser.close();
    await chrome.kill();
  } catch (err) {
    console.error(err);
  }
};

init();
