const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://pocket.shonenmagazine.com/');

  const scrapingData = await page.evaluate(() => {
    const daily = document.querySelectorAll('.daily > .daily-series');
    return [...daily].map(elem => {
      // 漫画情報の取得
      const items = elem.querySelectorAll('.daily-series-item');
      const itemsInfo = [...items].map(item => {
        return {
          title: item.querySelector('.daily-series-title').innerText,
          subtitle: item.querySelector('.daily-series-tagline').innerText,
          url: item.querySelector('a').href
        };
      });
      // 日付情報の取得
      const month = elem.querySelector('.month').innerText;
      const day = elem.querySelector('.day').innerText;
      const week = elem.querySelector('.week').innerText;

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
})();
