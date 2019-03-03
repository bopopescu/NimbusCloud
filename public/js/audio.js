$(document).ready(function()
{
	console.log("document ready")
	$("#convertAudio").on('submit', function(event)
	{
		event.preventDefault();
		console.log("clicked button")
		$.ajax({
			type: "POST",
			url: "/postAudio",
			data: {
				audio: "public/" + $("#audioInput")[0].files[0].name
			},
			success: function(res) {
				console.log("successfully ran")
				console.log(res);
				$("#list1").attr("hidden", false);
				$("#audio2Text").text("Transcripted Text: " + res);
			}
		})
	})
})
