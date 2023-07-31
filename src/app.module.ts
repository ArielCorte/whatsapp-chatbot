import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoamiController } from './whoami.controller';
import { WhoamiService } from './whoami.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './websocket/whatsapp.gateway';
import { ChatflowService } from './chatflow.service';

@Module({
  imports: [],
  controllers: [AppController, WhoamiController, WhatsappController],
  providers: [
    AppService,
    WhoamiService,
    WhatsappService,
    WhatsappGateway,
    ChatflowService,
  ],
})
export class AppModule {}
