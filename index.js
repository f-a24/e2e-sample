const fs = require("fs");
const puppeteer = require("puppeteer");
const resemble = require("resemblejs");

(async () => {
  if (process.argv.length > 2) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = process.argv[2];
    try {
      await page.goto(url);
      fs.statSync("before.png");
      await page.screenshot({ path: "after.png", fullPage: true });
      browser.close();

      const image1 = fs.readFileSync("before.png");
      const image2 = fs.readFileSync("after.png");
      resemble(image1)
        .compareTo(image2)
        .onComplete(res => {
          if (res.misMatchPercentage >= 0.01) {
            console.log("差文検知しました");
            fs.writeFileSync("diff.png", res.getBuffer());
          } else {
            console.log("差分ありません");
          }
        });
    } catch (err) {
      if (err.code === "ENOENT") {
        await page.screenshot({ path: "before.png", fullPage: true });
        console.log("比較元の画像を保存しました");
      } else {
        console.log("エラー：URLを確認してください");
      }
      browser.close();
    }
  } else {
    console.log("URLを入力してください");
  }
})();
