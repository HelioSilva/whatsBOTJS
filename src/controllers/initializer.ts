import { readFileSync, existsSync, writeFileSync, mkdir } from 'fs';
import latestVersion from 'latest-version';
import { Page } from 'puppeteer';
import { from, interval, timer } from 'rxjs';
import { map, takeUntil, tap, delay, switchMap } from 'rxjs/operators';
import { Whatsapp } from '../api/whatsapp';
import { CreateConfig, defaultOptions } from '../config/create-config';
import { upToDate } from '../utils/semver';
import { isAuthenticated, isInsideChat, needsToScan, retrieveQR } from './auth';
import { initWhatsapp, injectApi } from './browser';
import chalk = require('chalk');
import boxen = require('boxen');
import Spinnies = require('spinnies');
import path = require('path');
import {
  tokenSession,
  defaultTokenSession,
} from '../config/tokenSession.config';
import Counter = require('../lib/counter/Counter.js');
const { version } = require('../../package.json');

// Global
let updatesChecked = false;
const counter = new Counter();
/**
 * consult status of whatsapp client
 */

/**
 * Should be called to initialize whatsapp client
 */
export async function create(
  session = 'session',
  catchQR?: (qrCode: string, asciiQR: string) => void,
  statusFind?: (statusGet: string) => void,
  options?: CreateConfig
) {
  const spinnies = new Spinnies({
    disableSpins: options ? options.disableSpins : '',
  });

  //TODO:  update verify package
  // if (!updatesChecked) {
  //   spinnies.add('venom-version-spinner', {
  //     text: '🕷🕷🕷Checking for updates🕷🕷🕷',
  //   });
  //   checkVenomVersion(spinnies);
  //   updatesChecked = true;
  // }

  // Initialize whatsapp
  spinnies.add(`${session}-auth`, {
    text: 'Loading WhatsBOTJS',
  });

  const mergedOptions = { ...defaultOptions, ...options };
  let waPage = await initWhatsapp(session, mergedOptions);

  spinnies.update(`${session}-auth`, { text: 'Authenticating...' });
  const authenticated = await isAuthenticated(waPage);

  // If not authenticated, show QR and wait for scan
  if (authenticated) {
    // Wait til inside chat
    if (statusFind) {
      statusFind('isLogged');
    }

    await isInsideChat(waPage).toPromise();
    spinnies.succeed(`${session}-auth`, { text: 'Authenticated' });
  } else {
    if (statusFind) {
      statusFind('notLogged');
    }
    spinnies.update(`${session}-auth`, {
      text: `Authenticate to continue`,
    });

    if (mergedOptions.refreshQR <= 0 || mergedOptions.autoClose <= 0) {
      const { data, asciiQR } = await retrieveQR(waPage);
      if (catchQR) {
        catchQR(data, asciiQR);
      }

      if (mergedOptions.logQR) {
        console.log(`Scan QR for: ${session}                `);
        console.log(asciiQR);
      }
    } else {
      process.on('uncaughtException', function (err) {
        if (
          err.message ==
          'Protocol error (Runtime.callFunctionOn): Target closed.'
        )
          spinnies.succeed(session + '-auth', { text: 'Auto closed!' });
      });

      mergedOptions.autoClose
        ? grabQRUntilTimeOut(waPage, mergedOptions, session, catchQR)
        : grabQRUntilInside(waPage, mergedOptions, session, catchQR);
    }

    // Wait til inside chat
    await isInsideChat(waPage).toPromise();
    spinnies.succeed(`${session}-auth`, { text: 'Compilation Mutation...' });
  }
  spinnies.add(`${session}-inject`, { text: 'Injecting Sibionte...' });
  waPage = await injectApi(waPage);
  spinnies.succeed(`${session}-inject`, { text: 'Starting With Success!' });

  // Saving Token
  spinnies.add(`${session}-inject`, { text: 'Saving Token...' });
  if (true) {
    const localStorage = JSON.parse(
      await waPage.evaluate(() => {
        return JSON.stringify(window.localStorage);
      })
    );

    let { WABrowserId, WASecretBundle, WAToken1, WAToken2 } = localStorage;

    try {
      setTimeout(() => {
        mkdir(
          path.join(path.resolve(process.cwd(), 'tokens')),
          { recursive: true },
          (err) => {
            if (err) {
              spinnies.fail(`${session}-inject`, {
                text: 'Failed to create folder tokens...',
              });
            }
          }
        );
      }, 200);

      setTimeout(() => {
        writeFileSync(
          path.join(
            path.resolve(process.cwd(), 'tokens'),
            `${session}.data.json`
          ),
          JSON.stringify({ WABrowserId, WASecretBundle, WAToken1, WAToken2 })
        );
        spinnies.succeed(`${session}-inject`, {
          text: 'Token saved successfully...',
        });
      }, 500);
    } catch (error) {
      spinnies.fail(`${session}-inject`, {
        text: ' Failed to save token...',
      });
    }
  }

  if (mergedOptions.debug) {
    const debugURL = `http://localhost:${readFileSync(
      `./${session}/DevToolsActivePort`
    ).slice(0, -54)}`;
    console.log(`\nDebug: \x1b[34m${debugURL}\x1b[0m`);
  }

  return new Whatsapp(waPage);
}

/**
 * Check the time remaining to autoClose from Counter class
 */
const countDown = (msTimeOut: number) => counter.getElapsedTime() < msTimeOut;

/**
 * Grab QRcode until timeout
 */
function grabQRUntilTimeOut(
  waPage: Page,
  options: CreateConfig,
  session: string,
  catchQR: (qrCode: string, asciiQR: string) => void
) {
  const isInside = isInsideChat(waPage);
  let timeInterval = 1000; //options.refreshQR > 0 && options.refreshQR <= options.autoClose ? options.refreshQR : 1000

  timer(0, timeInterval)
    .pipe(
      takeUntil(isInside),
      switchMap(() => retrieveQR(waPage))
    )
    .subscribe(async ({ data, asciiQR }) => {
      counter.counterInit();
      console.log(waPage.browser().process);
      countDown(options.autoClose) ? null : await waPage.close(); //Close Imediatly

      let timeOut = Math.round(
        (options.autoClose - counter.getElapsedTime()) / 1000
      );

      if (catchQR) {
        catchQR(data, asciiQR);
      }
      if (options.logQR) {
        console.clear();
        console.log(
          'Scan QR for: ' +
            session +
            '                ' +
            `(Time remaining for auto close ${timeOut} sec.)`
        );
        console.log(asciiQR);
      }
    });
}

/**
 * Grab QRcode until synced (inside chat)
 */
function grabQRUntilInside(
  waPage: Page,
  options: CreateConfig,
  session: string,
  catchQR: (qrCode: string, asciiQR: string) => void
) {
  const isInside = isInsideChat(waPage);
  timer(0, options.refreshQR)
    .pipe(
      takeUntil(isInside),
      switchMap(() => retrieveQR(waPage))
    )
    .subscribe(({ data, asciiQR }) => {
      if (catchQR) {
        catchQR(data, asciiQR);
      }
      if (options.logQR) {
        console.clear();
        console.log(`Scan QR for: ${session}                `);
        console.log(asciiQR);
      }
    });
}

/**
 * Checs for a new versoin of venom and logs
 */
function checkVenomVersion(spinnies) {
  latestVersion('venom-bot').then((latest) => {
    if (!upToDate(version, latest)) {
      logUpdateAvailable(version, latest);
    }

    spinnies.succeed('venom-version-spinner', { text: 'Checking for updates' });
  });
}

/**
 * Logs a boxen of instructions to update
 * @param current
 * @param latest
 */
function logUpdateAvailable(current: string, latest: string) {
  // prettier-ignore
  const newVersionLog =
  `There is a new version of ${chalk.bold(`Venom`)} ${chalk.gray(current)} ➜  ${chalk.bold.green(latest)}\n` +
  `Update your package by running:\n\n` +
  `${chalk.bold('\>')} ${chalk.blueBright('npm update venom-bot')}`;

  console.log(boxen(newVersionLog, { padding: 1 }));
  console.log(
    `For more info visit: ${chalk.underline(
      'https://github.com/orkestral/venom/blob/master/UPDATES.md'
    )}\n`
  );
}
