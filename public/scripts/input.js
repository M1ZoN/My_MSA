const check = document.getElementById("fileInput");
const selectedFile = document.getElementById("fasta");

selectedFile.addEventListener(
  "change",
  () => {
    const [file] = selectedFile.files;
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function (evt) {
        document.getElementById("fileInside").innerHTML = evt.target.result;
      };
      reader.onerror = function (evt) {
        alert("Error! Incorrect file.");
      };
    }
  },
  false
);

check.onclick = () => {
  document.getElementById("inputSequence").required = !check.checked;
  document.getElementById("fasta").required = check.checked;
};
