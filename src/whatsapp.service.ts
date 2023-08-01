import { Injectable } from '@nestjs/common';
import { Client, ClientOptions, LocalAuth, Message } from 'whatsapp-web.js';
import { ChatflowService } from './chatflow.service';

type HistoryFrom = 'apiMessage' | 'userMessage';

@Injectable()
export class WhatsappService {
  private clients: Map<string, Client>;
  private qrCodes: Map<string, string>;

  constructor(private readonly chatflowService: ChatflowService) {
    this.clients = new Map<string, Client>();
    this.qrCodes = new Map<string, string>();
  }

  createClientForUser({
    userId,
    qrCallback,
    readyCallback,
  }: {
    userId: string;
    qrCallback: (qr: string) => void;
    readyCallback: (message: string) => void;
  }) {
    if (this.clients.has(userId)) return 'user already created';

    const options: ClientOptions = {
      authStrategy: new LocalAuth({ clientId: userId }),
      qrMaxRetries: 5,
    };
    const client = new Client(options);

    client.on('qr', (qr) => {
      console.log('qr called');
      qrCallback(qr);
      this.qrCodes.set(userId, qr);
    });

    client.on('ready', () => {
      console.log('Client is ready!');
      readyCallback('ready');
    });

    client.on('message', async (msg) => {
      console.log(userId, msg.body);
      //const history = this.getHistory(msg);
      const result = await this.chatflowService.query({
        question: msg.body,
        sessionId: msg.from,
      });
      console.log(msg.from, result);
      client.sendMessage(msg.from, result);
    });

    client.initialize();

    this.clients.set(userId, client);

    return 'success';
  }

  formatMessage(msg: string): string {
    return msg.replace(/\n/g, '[d(shift)]\n[u(shift)]');
  }

  async getHistory(msg: Message): Promise<string> {
    //Promise<{ type: HistoryFrom; message: string }[]>
    const chat = await msg.getChat();
    const history = await chat.fetchMessages({ limit: 2 });
    const formatted = history.slice(0, -1).map((msg) => {
      //if (msg.fromMe) {
      //  return { type: 'apiMessage' as HistoryFrom, message: msg.body };
      //}
      //return { type: 'userMessage' as HistoryFrom, message: msg.body };
      return msg.body;
    });
    return formatted.join(' ');
  }

  getClientForUser(userId: string): Client | undefined {
    return this.clients.get(userId);
  }

  deleteClientForUser(userId: string): boolean {
    return this.clients.delete(userId);
  }

  getQrCodeForUser(userId: string): string | undefined {
    return this.qrCodes.get(userId);
  }
}
