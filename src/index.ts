import sequelize from 'sequelize';
import puppeteer from 'puppeteer';
import { error } from 'util';

interface NodeSelector {

}

async function doCrawl() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://pocket.shonenmagazine.com/');

  const scrapingData = await page.evaluate(() => {
    const daily = document.querySelectorAll('.daily > .daily-series');
    return [...daily].map((elem) => {
      // 漫画情報の取得
      const items = elem.querySelectorAll('.daily-series-item');
      const itemsInfo = [...items].map((item => ({

        title: item.querySelector<HTMLElement>('.daily-series-title')!.innerText,
        subtitle: item.querySelector<HTMLElement>('.daily-series-tagline')!.innerText,
        url: item.querySelector<HTMLAnchorElement>('a')!.href
      })));
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
  console.dir(scrapingData, { depth: 5 });
  await browser.close();
}

// doCrawl()

const seq = new sequelize('database_development', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// @ts-ignore
seq
  .authenticate()
  .then(() => {
    console.log('connected');
  })
  .catch((e) => {
    console.log('failure');
  });
