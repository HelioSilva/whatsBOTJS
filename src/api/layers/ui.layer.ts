import { Page } from 'puppeteer';
import { GroupLayer } from './group.layer';

declare module WAPI {
  const openChat: (chatId: string) => boolean;
  const openChatAt: (
    chatId: string,
    messageId: string
  ) => { wasVisible: boolean; alignAt: string };
}

export class UILayer extends GroupLayer {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Opens given chat at last message (bottom)
   * Will fire natural workflow events of whatsapp web
   * @param chatId
   */
  public async openChat(chatId: string) {
    return this.page.evaluate(
      (chatId: string) => WAPI.openChat(chatId),
      chatId
    );
  }

  /**
   * Opens chat at given message position
   * @param chatId Chat id
   * @param messageId Message id (For example: '06D3AB3D0EEB9D077A3F9A3EFF4DD030')
   */
  public async openChatAt(chatId: string, messageId: string) {
    return this.page.evaluate(
      (chatId: string) => WAPI.openChatAt(chatId, messageId),
      chatId
    );
  }
}
