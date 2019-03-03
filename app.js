const record = require('node-record-lpcm16');
var bodyParser = require("body-parser");
var express = require('express');
var speech = require('@google-cloud/speech');
// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const clientVision = new vision.ImageAnnotatorClient();

var fs = require('fs');
// Imports the Google Cloud client library
const language = require('@google-cloud/language');
// Instantiates a client
const languageClient = new language.LanguageServiceClient();
// for text rank algoritm
var tr = require('textrank');
var speechClient = new speech.SpeechClient();

var app = express();
var googleAPIkey = "AIzaSyCI4hhbY4WZpaVg2uGRqMYjRlY9IFwbknA"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// home page
app.get('/', function(req, res) {
  res.render('home');
});

// ------------------------ for recording page ----------------------------------
// const filename = '/Users/salomonpluviose/Desktop/TimTebowGreatestSpeech.mp3';
async function syncRecognize() {
  const encoding = 'LINEAR16';
  const sampleRateHertz = 16000;
  const languageCode = 'en-US';

  // const file = fs.readFileSync(filename);
  // const audioBytes = file.toString('base64');

  const audio = {
    // content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  };
  const request = {
    config: config
  };

  // Create a recognize stream
  const recognizeStream = speechClient.streamingRecognize(request).on('data', function(data) {
    if (data) {
      console.log("transcription: " + data.results[0].alternatives[0].transcript);
    } else {
      console.log("reached time limit");
    }
  });

  var dataForStream = {
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0'
  }

  record.start(dataForStream).pipe(recognizeStream)
}

app.get('/record', function(req, res) {
  res.render('record');
})
app.get('/photos', function(req, res) {
  res.render("photos");
});

app.post('/postphoto', function(req, res) {
  console.log("Value for image input is: " + req.body.image);
  var file = req.body.image;
  // aysnc function
  async function detectFulltext(fileName) {
  // [START vision_fulltext_detection]

    // Read a local image as a text document
    const [result] = await clientVision.documentTextDetection(fileName);
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text: ${fullTextAnnotation.text}`);
    res.json(fullTextAnnotation.text)
    fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        console.log(`Block confidence: ${block.confidence}`);
        block.paragraphs.forEach(paragraph => {
          console.log(`Paragraph confidence: ${paragraph}`);
        });
      });
    });
  // [END vision_fulltext_detection]
  }
  detectFulltext(file);
});

// ------------------------ for audio upload page ----------------------------------
async function syncRecognizeWave(filename) {
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  //const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  const encoding = 'LINEAR16';
  const sampleRateHertz = 44100;
  const languageCode = 'en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true
  };

  const audio = {
    content: fs.readFileSync(filename).toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };

  // console.log(request);
  // Detects speech in the audio file
  const [response] = await speechClient.recognize(request);
  console.log(response);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: `, transcription);
  // [END speech_transcribe_sync]
}

// // -------------------------- For audio page ----------------------------------
// array of entity objects
var entityList = [];

// order of entity importance counter
rank = 1;

var settings = { // does not compile, just pesudocode layout
    extractAmount: 1, // Extracts 6 sentences instead of the default 5.
    // Returns an array of the summarized sentences instead of a long string default is a string.
    summaryType: "array",
};

// console.log(sigSentences);

app.get('/audio', function(req, res) {
  res.render('audio');
});

app.post('/postAudio', function(req, res) {
  console.log("filename:"+req.body.audio);
  // ------------------------ for audio upload page ----------------------------------
  async function syncRecognizeWave(filename) {
    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    //const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
    const encoding = 'LINEAR16';
    const sampleRateHertz = 44100;
    const languageCode = 'en-US';

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      audioChannelCount: 2,
      enableSeparateRecognitionPerChannel: true
    };

    const audio = {
      content: fs.readFileSync(filename).toString('base64'),
    };

    const request = {
      config: config,
      audio: audio,
    };

    // console.log(request);
    // Detects speech in the audio file
    const [response] = await speechClient.recognize(request);
    console.log(response);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: `, transcription);
    res.json(transcription);
    // [END speech_transcribe_sync]
  }
  syncRecognizeWave(req.body.audio);
})

app.post('/analyzeAudio', function(req, res) {
  console.log("got request to analyze: " + req.body.text);
  var textRank = new tr.TextRank(req.body.text, settings);

  // array of most significant sigSentences
  var sigSentences = textRank.summarizedArticle;

  const document = {
    content: sigSentences,
    type: 'PLAIN_TEXT',
  };

  async function start() {
     const [result] = await languageClient.analyzeEntities({document});
     const entities = result.entities;
     var duplicates = new Set();

   //   console.log('Entities:');
     res.json(entities);
     entities.forEach(entity => {

       // if not duplicate
       if (!duplicates.has(entity.name)) {
         duplicates.add(entity.name);
         entityList.push({
           type: entity.type,
           name: entity.name,
           rank: rank,
           wikipedia_url: entity.metadata.wikipedia_url
         });
         rank += 1;
       }
     });
     // console.log(entityList);
   }
  start();
});

app.listen(3000, function() {
  console.log("runnung server boi");
});
