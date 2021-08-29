export const createProducts = (
  names: string[],
  links: string[],
  images: string[],
  prices: number[],
  details: string[][]
) => {
  const products: any = {};

  for (let i = 0; i < names.length; i++) {
    const productName = names[i];
    const productLink = links[i];
    const productImage = images[i];
    const productPrice = prices[i];
    const productDetails = details[i];

    if (!products[productName]) {
      products[productName] = new Product(
        productName,
        productLink,
        productImage,
        productPrice,
        productDetails
      );
    }
  }

  return products;
};

interface ProductProps {
  readonly name: string;
  readonly link: string;
  readonly image: string;
  price: number;
  readonly details: string[];
}

export default class Product implements ProductProps {
  name: string;
  link: string;
  image: string;
  price: number;
  details: string[];
  constructor(
    name: string,
    link: string,
    image: string,
    price: number,
    details: string[]
  ) {
    this.name = name;
    this.link = link;
    this.image = image;
    this.price = price;
    this.details = details;
  }

  info(this: Product) {
    return {
      name: this.name,
      link: this.link,
      image: this.image,
      price: this.price,
      details: this.details
    };
  }
}
