"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProducts = void 0;
const createProducts = (names, links, images, prices, details) => {
    const products = {};
    for (let i = 0; i < names.length; i++) {
        const productName = names[i];
        const productLink = links[i];
        const productImage = images[i];
        const productPrice = prices[i];
        const productDetails = details[i];
        if (!products[productName]) {
            products[productName] = new Product(productName, productLink, productImage, productPrice, productDetails);
        }
    }
    return products;
};
exports.createProducts = createProducts;
class Product {
    constructor(name, link, image, price, details) {
        this.name = name;
        this.link = link;
        this.image = image;
        this.price = price;
        this.details = details;
    }
    info() {
        return {
            name: this.name,
            link: this.link,
            image: this.image,
            price: this.price,
            details: this.details
        };
    }
}
exports.default = Product;
