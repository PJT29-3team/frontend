/**
 * 전용면적 표기.
 *
 * API가 내려주는 면적은 전용면적 ㎡다(국민주택 규격 59.92·84.82 …).
 * 화면에는 평으로 보여준다. ㎡ 값에 "평"만 붙이면 84.82㎡(26평)가
 * "84.8평"으로 나오므로 반드시 이 함수를 거쳐야 한다.
 */
export const SQM_PER_PYEONG = 3.305785;

/**
 * ㎡ → 평. 부동산에서 평수는 "26평"처럼 정수로 말하므로 반올림한다.
 *
 * @param {number|string|null} areaSqm 전용면적(㎡)
 * @returns {number|null} 평. 값이 없으면 null
 */
export function toPyeong(areaSqm) {
  if (areaSqm === null || areaSqm === undefined || areaSqm === "") return null;
  const sqm = Number(areaSqm);
  if (Number.isNaN(sqm)) return null;
  return Math.round(sqm / SQM_PER_PYEONG);
}

/**
 * ㎡ → "26평". 값이 없으면 "-".
 *
 * @param {number|string|null} areaSqm 전용면적(㎡)
 */
export function formatPyeong(areaSqm) {
  const pyeong = toPyeong(areaSqm);
  return pyeong === null ? "-" : `${pyeong}평`;
}
