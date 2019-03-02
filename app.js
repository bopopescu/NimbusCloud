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
  res.render('record');
});

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = client
  .streamingRecognize(request)
  .on('data', function(data) {
    if (data) {
      console.log("transcription: " + data.results[0].alternatives[0].transcript);
    }
  });

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
record.start({
  sampleRateHertz: sampleRateHertz,
  threshold: 0,
  // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
  verbose: false,
  recordProgram: 'rec', // Try also "arecord" or "sox"
  silence: '10.0',
}).pipe(recognizeStream);

app.listen(3000, function() {
  console.log("runnung server boi");
});
