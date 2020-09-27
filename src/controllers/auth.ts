import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as qrcode from 'qrcode-terminal';
import { from, merge } from 'rxjs';
import { take } from 'rxjs/operators';
import { existsSync, readFileSync } from 'fs';

/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
export const isAuthenticated = (waPage: puppeteer.Page) => {
  return merge(needsToScan(waPage), isInsideChat(waPage))
    .pipe(take(1))
    .toPromise();
};

export const needsToScan = (waPage: puppeteer.Page) => {
  return from(
    waPage
      .waitForSelector('body > div > div > .landing-wrapper', {
        timeout: 0,
      })
      .then(() => false)
  );
};

export const isInsideChat = (waPage: puppeteer.Page) => {
  return from(
    waPage
      .waitForFunction(
        `
        (document.getElementsByClassName('app')[0] &&
        document.getElementsByClassName('app')[0].attributes &&
        !!document.getElementsByClassName('app')[0].attributes.tabindex) || 
        (document.getElementsByClassName('two')[0] && 
        document.getElementsByClassName('two')[0].attributes && 
        !!document.getElementsByClassName('two')[0].attributes.tabindex)
        `,
        {
          timeout: 0,
        }
      )
      .then(() => true)
  );
};

export async function retrieveQR(page: puppeteer.Page) {
  const { code, data } = await decodeQR(page);
  const asciiQR = await asciiQr(code);
  return { code, data, asciiQR };
}

async function asciiQr(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    qrcode.generate(code, { small: true }, (qrcode) => {
      resolve(qrcode);
    });
  });
}

async function decodeQR(
  page: puppeteer.Page
): Promise<{ code: string; data: string }> {
  await page.waitForSelector('canvas', { timeout: 0 });
  await page.addScriptTag({
    path: require.resolve(path.join(__dirname, '../lib/jsQR', 'jsQR.js')),
  });

  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');

    // @ts-ignore
    const code = jsQR(
      context.getImageData(0, 0, canvas.width, canvas.height).data,
      canvas.width,
      canvas.height
    );

    return { code: code.data, data: canvas.toDataURL() };
  });
}

export async function auth_InjectToken(page: puppeteer.Page, session: string) {
  //Auth with token ->start<-
  const pathToken: string = path.join(
    path.resolve(process.cwd(), 'tokens'),
    `${session}.data.json`
  );

  let jsonToken: any;

  if (existsSync(pathToken)) {
    jsonToken = JSON.parse(readFileSync(pathToken).toString());

    if (!jsonToken) return;

    //if (jsonToken)
    return await page.evaluateOnNewDocument((session) => {
      localStorage.clear();
      Object.keys(session).forEach((key) =>
        localStorage.setItem(key, session[key])
      );
    }, jsonToken);
  }
  //End Auth with token

  //return await page.evaluateOnNewDocument(() => {
  // localStorage.setItem('WABrowserId', '"5AXJMPZneACe3iMkbH40+w=="');
  // localStorage.setItem(
  //   'WASecretBundle',
  //   '{"key":"iBZb0m3w6dMfpU9UwF9Tr6/ckNV1NxDqnuZA7De/KMM=","encKey":"KjvvH/np261TSPjoFCsaRitodt96TT7qecBK797Cc7c=","macKey":"iBZb0m3w6dMfpU9UwF9Tr6/ckNV1NxDqnuZA7De/KMM="}'
  // );
  // localStorage.setItem(
  //   'WAToken1',
  //   '"8qUJJ+jGYn5tgVnMk/wnOeTX2gZUzYED/R2nQHuz8Ek="'
  // );
  // localStorage.setItem(
  //   'WAToken2',
  //   '"1@9YlRlvFq4fFgrLe7DtvgHPC8TqTmFdDsUW3m/+uyyCSaUkzQbvJeIQ5RD0niIxWHGcN3/aiQ0J5PIg=="'
  // );
  //  });
}
