module.exports = {
  pairwiseAlign: function (first, second) {
    let matrix = [];
    const GAP = -2;
    const MISMATCH = -1;
    const MATCH = 1;

    // Initializing matrix to all 0's
    for (let i = 0; i <= second.length; i++) {
      let temp = [];
      for (let j = 0; j <= first.length; j++) {
        temp.push(0);
      }
      matrix.push(temp);
    }

    // Initializing start
    matrix[0][0] = {
      value: 0,
      direction: "S",
    };

    // Initializing left column to a previous + gap
    for (let i = 1; i <= second.length; i++) {
      let temp = {
        value: matrix[i - 1][0].value + GAP,
        direction: "V",
      };
      matrix[i][0] = temp;
    }

    // Initializing top row to a previous + gap
    for (let i = 1; i <= first.length; i++) {
      let temp = {
        value: matrix[0][i - 1].value + GAP,
        direction: "H",
      };
      matrix[0][i] = temp;
    }

    // Implementation of Needleman-Wunch Algorithm
    for (let i = 1; i <= second.length; i++) {
      for (let j = 1; j <= first.length; j++) {
        let vertical = matrix[i - 1][j].value + GAP;
        let horizontal = matrix[i][j - 1].value + GAP;
        let diagonal =
          matrix[i - 1][j - 1].value +
          (second[i - 1] === first[j - 1] ? MATCH : MISMATCH);
        let maxVal = Math.max(vertical, horizontal, diagonal);
        let dir = maxVal === vertical ? "V" : maxVal === horizontal ? "H" : "D";
        let temp = {
          value: maxVal,
          direction: dir,
        };
        matrix[i][j] = temp;
      }
    }
    let resFirst = [];
    let resSecond = [];
    let i = second.length;
    let j = first.length;
    while (matrix[i][j].direction !== "S") {
      if (matrix[i][j].direction === "D") {
        resFirst.unshift(first[j - 1]);
        resSecond.unshift(second[i - 1]);
        i--;
        j--;
      } else if (matrix[i][j].direction === "H") {
        resFirst.unshift(first[j - 1]);
        resSecond.unshift("-");
        j--;
      } else {
        resFirst.unshift("-");
        resSecond.unshift(second[i - 1]);
        i--;
      }
    }
    return [resFirst.join(""), resSecond.join("")];
  },
  coefficient: function (first, second) {
    let res = 0;

    for (let i = 0; i < first.length; i++) {
      if (first[i] === "-" || second[i] === "-") res -= 1;
      else if (first[i] === second[i]) res += 2;
      else res -= 2;
    }
    return res;
  },
  pairWithFirst: function (sequences) {
    let seqs = [...sequences];

    seqs.sort((a, b) => b.sequence.length - a.sequence.length);
    res = [];
    res.push({
      alignment: this.pairwiseAlign(seqs[0].sequence, seqs[1].sequence)[0],
      name: seqs[0].name,
    });
    for (let i = 1; i < seqs.length; i++) {
      res.push({
        alignment: this.pairwiseAlign(seqs[0].sequence, seqs[i].sequence)[1],
        name: seqs[i].name,
      });
    }
    return res;
  },
  msa: function (sequences) {
    let coeffs = [];
    let result = [];
    let visited = [];

    for (let i = 0; i < sequences.length; i++) {
      for (let j = i + 1; j < sequences.length; j++) {
        let temp = this.pairwiseAlign(
          sequences[i].sequence,
          sequences[j].sequence
        );
        coeffs.push({
          pair: [i, j],
          coef: this.coefficient(temp[0], temp[1]),
          alignment: temp,
          alignmentlen: temp[0].length,
          name: [sequences[i].name, sequences[j].name],
        });
      }
    }
    let sorted = coeffs.sort(
      (a, b) => b.coef - a.coef || b.alignmentlen - a.alignmentlen
    );
    result.push({ alignment: sorted[0].alignment[0], name: sorted[0].name[0] });
    visited.push(sorted[0].pair[0]);
    for (let i in sorted) {
      for (let j = 0; j < sorted[i].pair.length; j++) {
        if (!visited.includes(sorted[i].pair[j])) {
          if (sorted[i].alignmentlen > result[0].alignment.length) {
            for (let k = 0; k < result.length; k++) {
              let newAlign = this.pairwiseAlign(
                sorted[i].alignment[j],
                result[k].alignment
              );
              result.splice(k, 1, {
                alignment: newAlign[1],
                name: result[k].name,
              });
            }
          }
          visited.push(sorted[i].pair[j]);
          result.push({
            alignment: sorted[i].alignment[j],
            name: sorted[i].name[j],
          });
        }
      }
    }
    return result;
  },
  analyze: function (seq1, seq2, seq3) {
    let res = "";
    for (let i = 0; i < seq1.length; i++) {
      if (seq1[i] === seq2[i] && seq1[i] === seq3[i] && seq2[i] === seq3[i])
        res += "*";
      else res += " ";
    }
    return res;
  },
  notGap: function (seq) {
    let count = 0;
    for (let i in seq) {
      if (seq[i] !== "-") {
        count++;
      }
    }
    return count;
  },
};
