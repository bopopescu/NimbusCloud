$(document).ready(function() {
	console.log("document ready")
	$("#convertImage").on('submit', function(event)
	{
		event.preventDefault();
		console.log("clicked button")
		$.ajax({
			type: "POST",
			url: "/postphoto",
			data: {
				image: "public/" + $("#pictureInput")[0].files[0].name
			},
			success: function(res) {
				console.log("successfully ran")
				console.log(res);
				$("#list1").attr("hidden", false);
				$("#picture2Text").text("Interpreted Word: " + res);
			}
		})
	})
})
