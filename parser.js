const puppeteer = require('puppeteer');
const fs = require('fs');

class Parser {
  static async parse(addressLink, wrapper) {
    const link = addressLink || 'https://stolichki.ru/apteki';
    
    try {
      const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
        devtools: false,
      });
      const pages = await browser.pages();
      const page = pages[0];
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      // переходи на страницу
      await page.goto(`${link}`, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
      });
      // ждем загрузки селектора
      // await page.waitForSelector('a.pagination-widget__page-link_next');
      // пихаем в виртуальный браузер скрипт и выполняем его. Результат в переменную
      const result = await page.evaluate(async (wrapper = '.store-list-item') => {
        const addressArr = [];
        for (const addressElement of document.querySelectorAll(wrapper)) {
          const address = addressElement.querySelector('.store-link.text-success-class').textContent;
          addressArr.push(address)
        }
        const $result = document.querySelector('body');
        $result.querySelectorAll('img').forEach( (elem) => elem.remove())
        $result.querySelectorAll('svg').forEach( (elem) => elem.remove())
        $result.querySelectorAll('ymaps').forEach( (elem) => elem.remove())
        $result.querySelectorAll('input').forEach( (elem) => elem.remove())
        $result.querySelectorAll('button').forEach( (elem) => elem.remove())
        return { html: $result.innerHTML, addressArr };
      }, wrapper, // передаем параметры в скрипт внутрь браузера
      // ждем domcontentloaded перед выполнением скрипта
      {
        waitUntil: 'domcontentloaded',
      });
      // че получилось в консоль
      // console.log('addressArr = = =>', result.addressArr);
      // закрываем браузер
      await browser.close();
      return { html: result.html };
    } catch (err) {
      console.log(err);
    }
    return { err: 'error' };
  }
}

// Parser.parse('https://leroymerlin.ru/shop/')
// .then(txt => fs.writeFileSync('zaglushka.txt', JSON.stringify(txt)));

module.exports = Parser;
