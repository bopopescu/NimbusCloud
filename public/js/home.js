$( document ).ready(function() {
  var recording = false;
  var recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true
  recognition.onresult = (event) => {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) { //Final results
            console.log("final results: " + event.results[i][0].transcript);   //Of course – here is the place to do useful things with the results.
            // $(".text").append(event.results[i][0].transcript + ".");
            $("#comment").append(event.results[i][0].transcript + ".")
        } else {   //i.e. interim...
            console.log("interim results: " + event.results[i][0].transcript);  //You can use these results to give the user near real time experience.
        }
    }
    // const speechToText = event.results[0][0].transcript;
    // console.log(speechToText);
    // console.log(event.results);
  }
  $("#record").on('click', function(event) {
    event.preventDefault();
    console.log("clicked on record");
    window.location.href = window.location.href + "record"
  });
  $("#upload").on('click', function(event) {
    event.preventDefault();
    console.log("clicked on record");
    window.location.href = window.location.href + "audio"
  });
  $("#photo").on('click', function(event) {
    event.preventDefault();
    console.log("clicked on record");
    window.location.href = window.location.href + "photos"
  });

  $("#recording").on('click', function(event) {
    event.preventDefault();
    console.log("tryna record");
    if (recording) {
      recording = false;
      $("#recording").text("Start Recording")
      recognition.stop();
      // button to analyze speech
      var text = $("#comment")[0].value
      // unhide button
      $("#analyze").attr("hidden", false);
    } else {
      recording = true;
      $("#recording").text("Stop Recording")
      recognition.start();
    }
  });

  $("#analyze").on('click', function(event) {
    event.preventDefault();
    console.log("analyzing...");
    var text = $("#comment")[0].value
    $.ajax({
			type: "POST",
			url: "/analyzeAudio",
			data: {
				text: text
			},
			success: function(res) {
				console.log("successfully ran")
				console.log(res);
			}
		})
  })

});
