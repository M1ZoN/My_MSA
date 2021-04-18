const express = require("express");
const bodyParser = require("body-parser");
const functions = require("./public/scripts/functions");
const fs = require("fs");

console.clear();

const PORT = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var globalresultans;

app.get("/", (req, res) => {
  res.render("input");
});

app.post("/result", (req, res) => {
  let parsed = [];
  let resultant = [];
  let error = false;
  if (req.body.fileInput) {
    let input = req.body.fileInside.split("\r\n");
    let tempSequence = "";
    for (let i = 0; i < input.length; i++) {
      if (input[i][0] === ">") {
        if (tempSequence.length > 0) parsed.push(tempSequence);
        parsed.push(input[i]);
        tempSequence = "";
      } else {
        tempSequence += input[i];
      }
    }
    parsed.push(tempSequence);
  } else {
    parsed = req.body.inputSequence.split("\r\n");
  }
  for (let i = 0; i < parsed.length; i += 2) {
    let tempSeq = {};
    tempSeq.name = parsed[i];
    tempSeq.sequence = parsed[i + 1];
    resultant.push(tempSeq);
    if (parsed[i].length <= 0 || i + 1 === parsed.length) error = true;
  }
  let sequences = [];
  for (let i = 0; i < resultant.length; i++) {
    sequences.push(resultant[i].sequence);
  }
  if (sequences.length < 2 || error) {
    res.render("error");
  } else {
    globalresultans = resultant;
    let starAlign = functions.pairWithFirst(resultant);
    let clustalW = functions.msa(resultant);
    let namesStar = [];
    for (let i in starAlign) {
      namesStar.push(starAlign[i].name.split(" ", 1)[0]);
    }
    let namesClustal = [];
    for (let i in clustalW) {
      namesClustal.push(clustalW[i].name.split(" ", 1)[0]);
    }
    let starAlignments = [];
    let clustalFinal = [];
    for (let i = 0; i < starAlign.length; i++) {
      starAlignments.push(starAlign[i].alignment.match(/.{1,60}/g));
    }
    for (let i = 0; i < clustalW.length; i++) {
      clustalFinal.push(clustalW[i].alignment.match(/.{1,60}/g));
    }
    let clustalHelper = [];
    let alignmentHelper = [];
    for (let i = 0, j = 0; i < starAlignments[0].length; i++) {
      alignmentHelper.push(
        functions.analyze(
          starAlignments[j][i],
          starAlignments[++j][i],
          starAlignments[++j][i]
        )
      );
      j = 0;
    }
    for (let i = 0, j = 0; i < clustalFinal[0].length; i++) {
      clustalHelper.push(
        functions.analyze(
          clustalFinal[j][i],
          clustalFinal[++j][i],
          clustalFinal[++j][i]
        )
      );
      j = 0;
    }
    let finalStar = [];
    let finalClustal = [];
    for (let i = 0, j = 0; i < starAlignments[0].length; i++) {
      finalStar.push(starAlignments[j][i]);
      finalStar.push(starAlignments[++j][i]);
      finalStar.push(starAlignments[++j][i]);
      finalStar.push(alignmentHelper[i]);
      j = 0;
    }
    for (let i = 0, j = 0; i < clustalFinal[0].length; i++) {
      finalClustal.push(clustalFinal[j][i]);
      finalClustal.push(clustalFinal[++j][i]);
      finalClustal.push(clustalFinal[++j][i]);
      finalClustal.push(clustalHelper[i]);
      j = 0;
    }
    res.render("output", {
      star: starAlignments,
      helperStar: alignmentHelper,
      clustalw: finalClustal,
    });
    result = "";
    result += "Star Alignment approach:\n";
    for (let i = 0, j = 0; i < finalStar.length; i += 4) {
      result +=
        namesStar[j] +
        "   " +
        finalStar[i] +
        "   " +
        functions.notGap(finalStar[i]) +
        "\n" +
        namesStar[j + 1] +
        "   " +
        finalStar[i + 1] +
        "   " +
        functions.notGap(finalStar[i + 1]) +
        "\n" +
        namesStar[j + 2] +
        "   " +
        finalStar[i + 2] +
        "   " +
        functions.notGap(finalStar[i + 2]) +
        "\n" +
        "              " +
        finalStar[i + 3] +
        "\n\n";
    }
    result += "\nPhylogenetic tree approach:\n";
    for (let i = 0, j = 0; i < finalClustal.length; i += 4) {
      result +=
        namesClustal[j] +
        "   " +
        finalClustal[i] +
        "   " +
        functions.notGap(finalClustal[i]) +
        "\n" +
        namesClustal[j + 1] +
        "   " +
        finalClustal[i + 1] +
        "   " +
        functions.notGap(finalClustal[i + 1]) +
        "\n" +
        namesClustal[j + 2] +
        "   " +
        finalClustal[i + 2] +
        "   " +
        functions.notGap(finalClustal[i + 2]) +
        "\n" +
        "              " +
        finalClustal[i + 3] +
        "\n\n";
    }
  }
});

app.post("/download", (req, res) => {
  const sizeN = ".{1," + req.body.sizeN + "}";
  console.log(sizeN);
  const re = new RegExp(sizeN, "g");
  let starAlign = functions.pairWithFirst(globalresultans);
  let clustalW = functions.msa(globalresultans);
  let namesStar = [];
  for (let i in starAlign) {
    namesStar.push(starAlign[i].name.split(" ", 1)[0]);
  }
  let namesClustal = [];
  for (let i in clustalW) {
    namesClustal.push(clustalW[i].name.split(" ", 1)[0]);
  }
  let starAlignments = [];
  let clustalFinal = [];
  for (let i = 0; i < starAlign.length; i++) {
    starAlignments.push(starAlign[i].alignment.match(re));
  }
  for (let i = 0; i < clustalW.length; i++) {
    clustalFinal.push(clustalW[i].alignment.match(re));
  }
  let clustalHelper = [];
  let alignmentHelper = [];
  console.log(starAlignments);
  for (let i = 0, j = 0; i < starAlignments[0].length; i++) {
    alignmentHelper.push(
      functions.analyze(
        starAlignments[j][i],
        starAlignments[++j][i],
        starAlignments[++j][i]
      )
    );
    j = 0;
  }
  for (let i = 0, j = 0; i < clustalFinal[0].length; i++) {
    clustalHelper.push(
      functions.analyze(
        clustalFinal[j][i],
        clustalFinal[++j][i],
        clustalFinal[++j][i]
      )
    );
    j = 0;
  }
  let finalStar = [];
  let finalClustal = [];
  for (let i = 0, j = 0; i < starAlignments[0].length; i++) {
    finalStar.push(starAlignments[j][i]);
    finalStar.push(starAlignments[++j][i]);
    finalStar.push(starAlignments[++j][i]);
    finalStar.push(alignmentHelper[i]);
    j = 0;
  }
  for (let i = 0, j = 0; i < clustalFinal[0].length; i++) {
    finalClustal.push(clustalFinal[j][i]);
    finalClustal.push(clustalFinal[++j][i]);
    finalClustal.push(clustalFinal[++j][i]);
    finalClustal.push(clustalHelper[i]);
    j = 0;
  }

  let result = "";
  result += "Star Alignment approach:\n";
  let trow1 = 0;
  let trow2 = 0;
  let trow3 = 0;
  for (let i = 0, j = 0; i < finalStar.length; i += 4) {
    result +=
      namesStar[j] +
      "   " +
      finalStar[i] +
      "   " +
      (trow1 + functions.notGap(finalStar[i])) +
      "\n" +
      namesStar[j + 1] +
      "   " +
      finalStar[i + 1] +
      "   " +
      (trow2 + functions.notGap(finalStar[i + 1])) +
      "\n" +
      namesStar[j + 2] +
      "   " +
      finalStar[i + 2] +
      "   " +
      (trow3 + functions.notGap(finalStar[i + 2])) +
      "\n" +
      "              " +
      finalStar[i + 3] +
      "\n\n";
    trow1 += functions.notGap(finalStar[i]);
    trow2 += functions.notGap(finalStar[i + 1]);
    trow3 += functions.notGap(finalStar[i + 2]);
  }
  result += "\nPhylogenetic tree approach:\n";
  let row1 = 0;
  let row2 = 0;
  let row3 = 0;
  for (let i = 0, j = 0; i < finalClustal.length; i += 4) {
    result +=
      namesClustal[j] +
      "   " +
      finalClustal[i] +
      "   " +
      (row1 + functions.notGap(finalClustal[i])) +
      "\n" +
      namesClustal[j + 1] +
      "   " +
      finalClustal[i + 1] +
      "   " +
      (row2 + functions.notGap(finalClustal[i + 1])) +
      "\n" +
      namesClustal[j + 2] +
      "   " +
      finalClustal[i + 2] +
      "   " +
      (row3 + functions.notGap(finalClustal[i + 2])) +
      "\n" +
      "              " +
      finalClustal[i + 3] +
      "\n\n";
    row1 += functions.notGap(finalClustal[i]);
    row2 += functions.notGap(finalClustal[i + 1]);
    row3 += functions.notGap(finalClustal[i + 2]);
  }

  fs.writeFileSync(__dirname + "/public/MSAresults.txt", result);
  res.download(__dirname + "/public/MSAresults.txt", "MSAresults.txt");
});

app.listen(PORT, function () {
  console.log("Server started sucessfully on port: " + PORT);
});
