const record = require('node-record-lpcm16');
var express = require('express');
var speech = require('@google-cloud/speech');

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

// home page
app.get('/', function(req, res) {
  res.render('home');
});

// ------------------------ for recording page ----------------------------------
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
const recognizeStream = speechClient
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


// -------------------------- For audio page ----------------------------------
const text = "On Monday, the TSA announced a peculiar new security measure to take effect within 96 hours. Passengers flying into the US on foreign airlines from eight Muslim countries would be prohibited from carrying aboard any electronics larger than a smartphone. They would have to be checked and put into the cargo hold. And now the UK is following suit. It's difficult to make sense of this as a security measure, particularly at a time when many people question the veracity of government orders, but other explanations are either unsatisfying or damning. So let's look at the security aspects of this first. Laptop computers aren't inherently dangerous, but they're convenient carrying boxes. This is why, in the past, TSA officials have demanded passengers turn their laptops on: to confirm that they're actually laptops and not laptop cases emptied of their electronics and then filled with explosives. Forcing a would-be bomber to put larger laptops in the plane's hold is a reasonable defense against this threat, because it increases the complexity of the plot. Both the shoe-bomber Richard Reid and the underwear bomber Umar Farouk Abdulmutallab carried crude bombs aboard their planes with the plan to set them off manually once aloft. Setting off a bomb in checked baggage is more work, which is why we don't see more midair explosions like Pan Am Flight 103 over Lockerbie, Scotland, in 1988. Security measures that restrict what passengers can carry onto planes are not unprecedented either. Airport security regularly responds to both actual attacks and intelligence regarding future attacks. After the liquid bombers were captured in 2006, the British banned all carry-on luggage except passports and wallets. I remember talking with a friend who traveled home from London with his daughters in those early weeks of the ban. They reported that airport security officials confiscated every tube of lip balm they tried to hide. Similarly, the US started checking shoes after Reid, installed full-body scanners after Abdulmutallab and restricted liquids in 2006. But all of those measure were global, and most lessened in severity as the threat diminished. This current restriction implies some specific intelligence of a laptop-based plot and a temporary ban to address it. However, if that's the case, why only certain non-US carriers? And why only certain airports? Terrorists are smart enough to put a laptop bomb in checked baggage from the Middle East to Europe and then carry it on from Europe to the US. Why not require passengers to turn their laptops on as they go through security? That would be a more effective security measure than forcing them to check them in their luggage. And lastly, why is there a delay between the ban being announced and it taking effect? Even more confusing, The New York Times reported that \"officials called the directive an attempt to address gaps in foreign airport security, and said it was not based on any specific or credible threat of an imminent attack.\" The Department of Homeland Security FAQ page makes this general statement, \"Yes, intelligence is one aspect of every security-related decision,\" but doesn't provide a specific security threat. And yet a report from the UK states the ban \"follows the receipt of specific intelligence reports.\" Of course, the details are all classified, which leaves all of us security experts scratching our heads. On the face of it, the ban makes little sense. One analysis painted this as a protectionist measure targeted at the heavily subsidized Middle Eastern airlines by hitting them where it hurts the most: high-paying business class travelers who need their laptops with them on planes to get work done. That reasoning makes more sense than any security-related explanation, but doesn't explain why the British extended the ban to UK carriers as well. Or why this measure won't backfire when those Middle Eastern countries turn around and ban laptops on American carriers in retaliation. And one aviation official told CNN that an intelligence official informed him it was not a \"political move.\" In the end, national security measures based on secret information require us to trust the government. That trust is at historic low levels right now, so people both in the US and other countries are rightly skeptical of the official unsatisfying explanations. The new laptop ban highlights this mistrust.";


// array of entity objects
var entityList = [];

// order of entity importance counter
rank = 1;

// amount of important sentences to extract from text
var extractAmount = 5;

var settings = { // does not compile, just pesudocode layout
    extractAmount: extractAmount, // Extracts 6 sentences instead of the default 5.
    // Returns an array of the summarized sentences instead of a long string default is a string.
    summaryType: "array",
};
var textRank = new tr.TextRank(text,settings);

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

  console.log('Entities:');
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
  console.log(entityList);
}
start();
console.log(sigSentences);

app.get('/audio', function(req, res) {
  res.render('audio');
});

app.listen(3000, function() {
  console.log("runnung server boi");
});
