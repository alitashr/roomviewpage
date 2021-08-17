
export function compare(a, sortingKey, b, sortingOrder) {
  const item1 = a[sortingKey];
  const item2 = b[sortingKey];
  return item1 === item2 ? 0 : item1 < item2 ? -sortingOrder : sortingOrder;
}

export const previewMaterial = ({texture, selectedColor, yarnIndex, DesignColors}) => {
  const tex = parseInt(texture || "-1");
  if (tex !== -1) return tex;
  if (selectedColor && selectedColor === -1) return -1;
  let yi = yarnIndex || 0;
  yi = yi === -1 ? 0 : yi;
  if (yarnIndex === -1) return DesignColors[selectedColor].YarnDetails[yi].Material;
};

export const getDominantColor = designDetails => {
  if (!designDetails || !designDetails.DesignColors) return null;
  const smartKnot = designDetails.DesignColors.map(c => c.Knots).sort((a, b) => b - a);
  const smartIndex = smartKnot.length > 2 ? (smartKnot.length === 3 ? 1 : 2) : smartKnot.length - 1;
  const domC = designDetails.DesignColors.find(item => item.Knots === smartKnot[smartIndex]);
  if (domC) return domC.Color;
  else return null;
};