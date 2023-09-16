const express = require('express');
const app = express();
const session = require('express-session');
// const WebSocket = require('ws');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
require('dotenv').config();
  
app.use(express.static(__dirname + '/public'));
app.set('views', (__dirname + '/views'))
app.set('view engine', 'ejs');
app.use(
    session({
        secret : 'yoyohoneysingh',
        cookie : {
            maxAge : 60000 * 60 * 24
        },
        saveUninitialized : true,
        resave : false
    })
)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/audio', (req, res) => {
    const audioUrl = req.query.a;
    console.log(audioUrl);
    res.json({
        success: true
    })
});


app.get('/uploadResume', (req, res) => {
  const pdf = req.query.a;
  console.log(pdf);
  res.render('interview.ejs');
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server successfully running on port ${PORT}`);
});