module.exports = {
  newBubbleName: () => {
    var length = 10;
    var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var result = '';
    for(var i = 0; i < length; i++) {
      result += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return result;
  },
}
