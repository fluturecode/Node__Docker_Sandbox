import 'reflect-metadata';

import express from 'express';
import * as bodyParser from 'body-parser';

import { Request, Response, NextFunction } from 'express';

const app = express();
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send('Express server up and healthy!');
});

app.get('/hello-world', (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send('Hello World!');
});

app.get('/api/test/:dynamic', (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).send(`Dynamic route data works! You sent in ${req.params.dynamic.toString()}`);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).send('Sorry your request did not match any known routes :(');
});

app.listen(3000);

console.log('Express server up and running on port 3000!');