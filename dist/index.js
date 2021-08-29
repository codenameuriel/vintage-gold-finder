"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChromeLauncher = __importStar(require("chrome-launcher"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const axios_1 = __importDefault(require("axios"));
const product_1 = require("./product");
// loggers
const logComplete = () => console.log('Scraping complete!');
const logScraping = (scrapeData) => console.log(`Scraping ${scrapeData}...`);
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chrome = yield ChromeLauncher.launch({
            chromeFlags: ['--headless']
        });
        const response = yield axios_1.default.get(`http://localhost:${chrome.port}/json/version`);
        const { webSocketDebuggerUrl } = response.data;
        const browser = yield puppeteer_core_1.default.connect({
            browserWSEndpoint: webSocketDebuggerUrl
        });
        const isConnected = browser.isConnected();
        isConnected && console.log('Connected to Chrome...');
        const page = yield browser.newPage();
        const pages = yield browser.pages();
        // close default blank about page
        pages[0].close();
        // allow page unlimited time to load
        // await page.setDefaultNavigationTimeout(0);
        // await page.setViewport({
        //   width: 1200,
        //   height: 1200,
        //   deviceScaleFactor: 1
        // });
        page.goto('https://etsy.com/search/vintage?q=gold+jewelry');
        yield page.waitForNavigation();
        logScraping('product links');
        const productLinks = yield page.$$eval('div[class~=search-listing-card--desktop] > a.listing-link', (aTags) => aTags.map((aTag) => aTag.href));
        logComplete();
        logScraping('product images');
        // filter out the '?version=[0-9]' characters from the end of the string
        const productImages = yield page.$$eval('img[data-listing-card-listing-image]', (imgTags) => imgTags.map((imgTag) => imgTag.src.split(/\?version=[0-9]\b/)[0]));
        logComplete();
        logScraping('product names');
        const productNames = yield page.$$eval('div[class^="v2-listing-card__info"] > div > h3', (h3Tags) => h3Tags.map((h3Tag) => h3Tag.innerText));
        logComplete();
        logScraping('product prices');
        // use css 'or' operator to select either available span element
        const productPrices = yield page.$$eval('p.wt-text-title-01 > span[aria-hidden="true"] > span.currency-value, p.wt-text-title-01 > span.currency-value', (spanTags) => spanTags.map((spanTag) => parseFloat(spanTag.innerText)));
        logComplete();
        const productDetails = [];
        logScraping('product details');
        for (let link of productLinks) {
            const productPage = yield browser.newPage();
            productPage.goto(link);
            yield productPage.waitForNavigation();
            const pages = yield browser.pages();
            let detail = yield pages[pages.length - 1].$$eval('ul[class^="wt-text-body-01"] > li > div.wt-ml-xs-2, ul[class^="wt-text-body-01"] > li > div', (divs) => divs.map((d) => d.innerText));
            // remove empty strings
            detail = detail.filter((text) => text);
            productDetails.push(detail);
            productPage.close();
        }
        logComplete();
        const productsData = product_1.createProducts(productNames, productLinks, productImages, productPrices, productDetails);
        console.log(productsData);
        yield browser.close();
        yield chrome.kill();
    }
    catch (err) {
        console.error(err);
    }
});
init();
