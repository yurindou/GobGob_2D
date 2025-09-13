/**
 * Substring 
 * @param {*} num Any number
 * @param {*} digit Digit you want to get from the number of 1st arg.
 *                  String(123)[0] => "1"
 *                  String(123)[2] => "3"
 * @returns One digit from the number
 */
exports.getAnyDigit = function(num, digit) {
  return Number(String(num)[digit]);
}

/**
 * Get piece size 
 * @param {*} pid Piece id
 * @returns Piece size
 *          1: small
 *          2: middle
 *          3: large
 */
exports.getPieceSize = function(pid) {
    if (0 === pid || 3 === pid) {
        return 1
    } else if (1 === pid || 4 === pid) {
        return 2;
    } else if (2 === pid || 5 === pid) {
        return 3;
    }
}


exports.convertNumToAlphabet = function(index) {
    const alphabet = ["A", "B", "C"];
    return alphabet[index];
}

exports.convertNumToPieceSize = function(index) {
    const size = ["S", "M", "L"];
    console.log(index);
    return size[index];
}

exports.getPlayerName = function(player) {
    const me = "Yurindou";
    return player === "0" ? "Daichi" : me;
}