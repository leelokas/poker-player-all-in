/// <reference path='../typings/index.d.ts'/>
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Player } from './Player';

const VERSION = "shorthandedv3";

const app = express();
const player = new Player();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', ({}, res) => res.send(200, 'OK'));

app.post('/', (req, res) => {
    console.log('Req body is:', req.body);
    if (req.body.action === 'bet_request') {
        const betCallback = bet => {
            console.log('Our bet is:', bet);
            res.status(200).send(bet.toString());
        }
        player.betRequest(JSON.parse(req.body.game_state), betCallback);
    } else if (req.body.action === 'showdown') {
        player.showdown(JSON.parse(req.body.game_state));
        res.status(200).send('OK');
    } else if (req.body.action === 'version') {
        res.status(200).send(VERSION);
    } else {
        res.status(200).send('OK');
    }
});

const port = parseInt(process.env['PORT'] || 1337);
const host = "0.0.0.0";
app.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
