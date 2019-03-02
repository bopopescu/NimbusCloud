const record = require('node-record-lpcm16');
var express = require('express');
var speech = require('@google-cloud/speech');
var fs = require('fs');
var client = new speech.SpeechClient();

var app = express();
var googleAPIkey = "AIzaSyCI4hhbY4WZpaVg2uGRqMYjRlY9IFwbknA"

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', function(req, res) {
  res.render('home');
});

const filename = '/Users/salomonpluviose/Desktop/TimTebowGreatestSpeech.mp3';
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const file = fs.readFileSync(filename);
const audioBytes = file.toString('base64');

const audio = {
  content: audioBytes,
};
const config = {
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
  languageCode: 'en-US',
};
const request = {
  audio: audio,
  config: config,
};

// Create a recognize stream
const recognizeStream = client
.streamingRecognize(request)
.on('data', function(data) {
  if (data) {
    console.log("transcription: " + data.results[0].alternatives[0].transcript);
  }
});

var dataForStream = {
  sampleRateHertz: sampleRateHertz,
  threshold: 0,
  verbose: false,
  recordProgram: 'rec', // Try also "arecord" or "sox"
  silence: '10.0'
}

app.get('/record', function(req, res) {
  res.render('record', {
    record: record,
    stream: recognizeStream,
    startData: dataForStream
  });
});



/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */

// const request = {
//   config: {
//     encoding: encoding,
//     sampleRateHertz: sampleRateHertz,
//     languageCode: languageCode,
//   },
//   interimResults: false, // If you want interim results, set this to true
// };

// Start recording and send the microphone input to the Speech API
// record
//   .start({
    // sampleRateHertz: sampleRateHertz,
    // threshold: 0,
    // // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    // verbose: false,
    // recordProgram: 'rec', // Try also "arecord" or "sox"
    // silence: '10.0',
//   })
//   .on('error', console.error)
//   .pipe(recognizeStream);
// record.start({
//   sampleRateHertz: sampleRateHertz,
//   threshold: 0,
//   verbose: false,
//   recordProgram: 'rec',
//   silence: '10.0',
// }).pipe(recognizeStream);

app.listen(3000, function() {
  console.log("runnung server boi");
});
