document.addEventListener("DOMContentLoaded", function(event) {

  var inputElement = document.getElementById("input");
  var dropbox;

  inputElement.addEventListener("change", handleFiles, false);

  dropbox = document.getElementById("dropbox");
  dropbox.addEventListener("dragenter", dragenter, false);
  dropbox.addEventListener("dragover", dragover, false);
  dropbox.addEventListener("drop", drop, false);

  function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function dragover(e) {
    console.log("file(s) dragged over");
    e.stopPropagation();
    e.preventDefault();
  }

  function drop(e) {

    var dt = e.dataTransfer;
    var files = dt.files;

    //handleFiles(files);
    console.log("file selected", files);

    e.stopPropagation();
    e.preventDefault();
  }

  function handleFiles() {
    var fileList = this.files; /* now you can work with the file list */
    console.log("file selected", fileList);
  }

});
