import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

import appMetaData from '@metadata';

export class SwaggerUtility {
  app: INestApplication;

  constructor() { }

  initializeSwagger(app: INestApplication) {
    this.app = app;

    const swaggerDocumentBuilder = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Node Boilerplate')
      .setDescription('Shift3 Node boilerplate built on Nestjs')
      .setVersion(appMetaData.version)
      .build();

    const swaggerDocument = SwaggerModule.createDocument(this.app, swaggerDocumentBuilder);

    SwaggerModule.setup('swagger', this.app, swaggerDocument);
  }
}