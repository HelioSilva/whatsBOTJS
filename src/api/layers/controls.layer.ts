import { Page } from 'puppeteer';
import { GroupLayer } from './group.layer';
import { UILayer } from './ui.layer';

declare module WAPI {
  const deleteConversation: (chatId: string) => boolean;
  const clearChat: (chatId: string) => void;
  const deleteMessages: (
    contactId: string,
    messageId: string[] | string,
    onlyLocal: boolean
  ) => any;
  const markUnseenMessage: (messageId: string) => boolean;
}

export class ControlsLayer extends UILayer {
  constructor(page: Page) {
    super(page);
  }

  /**
   * puts the chat as unread
   * @param contactId
   * @returns boolean
   */
  public async markUnseenMessage(contactId: string) {
    return this.page.evaluate(
      (contactId) => WAPI.markUnseenMessage(contactId),
      contactId
    );
  }

  /**
   * Deletes the given chat
   * @param chatId
   * @returns boolean
   */
  public async deleteChat(chatId: string) {
    return this.page.evaluate(
      (chatId) => WAPI.deleteConversation(chatId),
      chatId
    );
  }

  /**
   * Deletes all messages of given chat
   * @param chatId
   * @returns boolean
   */
  public async clearChat(chatId: string) {
    return this.page.evaluate((chatId) => WAPI.clearChat(chatId), chatId);
  }

  /**
   * Deletes message of given message id
   * @param chatId The chat id from which to delete the message.
   * @param messageId The specific message id of the message to be deleted
   * @param onlyLocal If it should only delete locally (message remains on the other recipienct's phone). Defaults to false.
   */
  public async deleteMessage(
    chatId: string,
    messageId: string[] | string,
    onlyLocal = false
  ) {
    return await this.page.evaluate(
      ({ contactId, messageId, onlyLocal }) =>
        WAPI.deleteMessages(contactId, messageId, onlyLocal),
      { contactId: chatId, messageId, onlyLocal }
    );
  }
}
