import { Sequelize } from 'sequelize-typescript';
import * as puppeteer from 'puppeteer';
import { Comic } from './models/Comic';


async function doCrawl() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://pocket.shonenmagazine.com/');

  const scrapingData = await page.evaluate(() => {
    const daily = document.querySelectorAll('.daily > .daily-series');
    return [...daily].map((elem) => {
      // 漫画情報の取得
      const items = elem.querySelectorAll('.daily-series-item');
      const itemsInfo = [...items].map((item) => {
        const ret = {
          title: item.querySelector<HTMLElement>('.daily-series-title')!.innerText,
          explanation: item.querySelector<HTMLElement>('.daily-series-tagline')!.innerText,
          url: item.querySelector<HTMLAnchorElement>('a')!.href
        };
        return ret;
      });
      // 日付情報の取得
      const month = elem.querySelector<HTMLElement>('.month')!.innerText;
      const day = elem.querySelector<HTMLElement>('.day')!.innerText;
      const week = elem.querySelector<HTMLElement>('.week')!.innerText;

      return {
        month,
        day,
        week,
        itemsInfo
      };
    });
  });

  await browser.close();
  return scrapingData;
}

const seq = new Sequelize({
  database: 'comicdb',
  username: 'root',
  password: 'password',
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
  //   max: 5,
  //   min: 0,
  //   acquire: 0,
  //   idle: 1000
  },
  modelPaths: [`${__dirname}/models/*.js`]
});

doCrawl().then((data) => {
  return data
    .map((val: any) => val.itemsInfo)
    .map((items: any[]) => {
      return items.map((item) => new Comic(item));
    })
    .reduce((seed: any, next: any) => seed.concat(next), []);
}).then((items) => {
  return Promise.all(items.map((item:Comic) => item.save()));
}).catch((e) => {
  console.log(e);
}).then(() => {
  return seq.close();
})
