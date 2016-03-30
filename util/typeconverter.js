var TypeTable = {
  "ti" : "條",
  "wn" : "萬",
  "tn" : "筒",
  "jn" : "紅中",
  "fa" : "青發",
  "bb" : "白板",
  "ts" : "春",
  "sa" : "夏",
  "ch" : "秋",
  "dn" : "冬",
  "me" : "梅",
  "ln" : "蘭",
  "jw" : "竹",
  "ju" : "菊",
  "bf" : "北風",
  "nf" : "南風",
  "df" : "東風",
  "xf" : "西風",
};

var SubtypeTable = {
  ""   : "",
  "1"  : "一",
  "2"  : "二",
  "3"  : "三",
  "4"  : "四",
  "5"  : "五",
  "6"  : "六",
  "7"  : "七",
  "8"  : "八",
  "9"  : "九",
};


const UrlToReadable = {
  urlToReadable: function (urlType) {
    var type = urlType.substring(0, 2);
    var subtype = urlType.substring(2);
    return SubtypeTable[subtype] + TypeTable[type];
  }
};


module.exports = UrlToReadable;
