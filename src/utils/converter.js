import convert from "convert-units";
export const degToRad = deg => (deg * Math.PI) / 180;
export const radToDeg = deg => (deg * 180) / Math.PI;

export function convertArrIntoRad(arrDeg) {
  return arrDeg.map((angle) => (angle * Math.PI) / 180);
}
export const convertArrintoDeg = (arrRad) => {
  return arrRad.map((angle) => (angle * 180) / Math.PI);
};

export const convertUnit = (from, to, value, fixed) => {
  const converted = convert(value).from(from).to(to);
  if (fixed) return Number(converted.toFixed(fixed));
  else return converted;
};

export function convertNumberToFeetInch(f, unit) {
  if (unit !== "ft") return f;
  var ft = Math.floor(f);
  var inch = Math.round(12 * (f - ft));
  if (inch === 12) {
    ft++;
    inch = 0;
  }
  return ft + "′" + (inch > 0 ? inch + "″" : "");
}
export function convertFeetInchToNumber(f, unit) {
  if (unit !== "ft") return f;
  var rex = /[-+]?[0-9]*\.?[0-9]+/g;
  var match = f.match(rex);
  var feet, inch;
  if (match) {
    feet = parseFloat(match[0]);
    inch = match.length > 1 ? parseFloat(match[1]) : 0;
    if (feet > 0 && inch >= 0 && inch < 12) {
      return feet + inch / 12;
    }
  }
  return null;
}

export const leftFillNum = (num, targetLength) => num.toString().padStart(targetLength, 0);

export const convertTilePointToName = (i, j) => `${leftFillNum(i, 2)}_${leftFillNum(j, 2)}`;
export const convertNameToTilePoint = (name) => {
  const x = parseInt(name.trim().substring(0, 2));
  const y = parseInt(name.trim().substring(3, 5));
  return { x, y };
};

