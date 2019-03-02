const record = require('node-record-lpcm16');
var bodyParser = require("body-parser");
var express = require('express');
var speech = require('@google-cloud/speech');
var fs = require('fs');
var client = new speech.SpeechClient();

var app = express();
var googleAPIkey = "AIzaSyCI4hhbY4WZpaVg2uGRqMYjRlY9IFwbknA"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/', function(req, res) {
  res.render('record');
});

app.get('/photos', function(req, res) {
  res.render("photos");
});

async function detectFulltext(fileName) {
  // [START vision_fulltext_detection]

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  //const fileName = 'STOP_sign.jpg';

  // Read a local image as a text document
  const [result] = await client.documentTextDetection(fileName);
  const fullTextAnnotation = result.fullTextAnnotation;
  console.log(`Full text: ${fullTextAnnotation.text}`);
  fullTextAnnotation.pages.forEach(page => {
    page.blocks.forEach(block => {
      console.log(`Block confidence: ${block.confidence}`);
      block.paragraphs.forEach(paragraph => {
        console.log(`Paragraph confidence: ${paragraph.confidence}`);
        paragraph.words.forEach(word => {
          const wordText = word.symbols.map(s => s.text).join('');
          console.log(`Word text: ${wordText}`);
          console.log(`Word confidence: ${word.confidence}`);
          word.symbols.forEach(symbol => {
            console.log(`Symbol text: ${symbol.text}`);
            console.log(`Symbol confidence: ${symbol.confidence}`);
          });
        });
      });
    });
  });
  // [END vision_fulltext_detection]
}

app.post('/postphoto', function(req, res) {
  console.log("Value for image input is: " + req.body.image);
  var file = req.body.image;
  detectFulltext(file);

});

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
//const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
//const encoding = 'LINEAR16';
//const sampleRateHertz = 16000;
//const languageCode = 'en-US';

//const request = {
  //config: {
    //encoding: encoding,
    //sampleRateHertz: sampleRateHertz,
    //languageCode: languageCode,
  //},
  //interimResults: false, // If you want interim results, set this to true
//};

// Create a recognize stream
//const recognizeStream = client
  //.streamingRecognize(request)
  //.on('data', function(data) {
    //if (data) {
      //console.log("transcription: " + data.results[0].alternatives[0].transcript);
    //}
  //});

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

//record.start({
  //sampleRateHertz: sampleRateHertz,
  //threshold: 0,
  // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
  //verbose: false,
  //recordProgram: 'rec', // Try also "arecord" or "sox"
  //silence: '10.0',
//}).pipe(recognizeStream);

//detectFulltext("public/cats.jpg");

app.listen(3000, function() {
  console.log("runnung server boi");
});