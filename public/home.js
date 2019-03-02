$( document ).ready(function() {
  $("#record").on('click', function(event) {
    event.preventDefault();
    console.log("clicked on record");
    window.location.href = window.location.href + "record"
  });
});
