import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PAGE_W = 210; // mm (A4)
const PAGE_H = 297; // mm (A4)
const MARGIN = 14;  // mm 좌우 여백
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── 한글 폰트를 Base64로 임베드하지 않고 Noto Sans KR은 사용 못하므로
//    jsPDF 기본 폰트(helvetica)를 사용. 한글은 canvas 캡처로 해결.
// ── 텍스트 페이지(1페이지)는 html2canvas로 렌더링한 임시 div를 캡처,
//    상품 섹션(2페이지~)은 실제 DOM 섹션을 캡처.

/**
 * 요약 텍스트를 그릴 오프스크린 div를 만들어 canvas로 캡처한다.
 * @param {string} summaryText
 * @param {object} meta  - { investAmount, remainingCash, monthlyNeed, riskLabel }
 * @returns {Promise<HTMLCanvasElement>}
 */
async function renderSummaryPage(summaryText, meta) {
  const div = document.createElement('div');

  // ✅ z-index:-1 대신 화면 밖(왼쪽)으로 밀어둬야 html2canvas가 정상 캡처함
  div.style.cssText = `
    position: absolute;
    top: 0;
    left: -9999px;
    width: 794px;
    background: #fff;
    font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
    color: #1a1a1a;
    padding: 56px 60px 60px;
    box-sizing: border-box;
    visibility: visible;
    pointer-events: none;
  `;

  const formatWon = (n) => {
    if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억 원`;
    if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만 원`;
    return `${n.toLocaleString()}원`;
  };

  div.innerHTML = `
    <div style="border-bottom:3px solid #f5a623;padding-bottom:16px;margin-bottom:28px;">
      <div style="font-size:11px;color:#888;letter-spacing:1px;margin-bottom:6px;">ASSET DESIGN REPORT</div>
      <h1 style="margin:0;font-size:26px;font-weight:800;color:#1a1a1a;">기간별 금융상품 추천 결과</h1>
      <p style="margin:8px 0 0;font-size:12px;color:#666;">
        발행일: ${new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })}
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
      ${[
        { label: '투자 금액', value: formatWon(meta.investAmount), color: '#e8a000' },
        { label: '남길 현금', value: formatWon(meta.remainingCash), color: '#333' },
        { label: '매달 쓸 돈', value: formatWon(meta.monthlyNeed), color: '#333' },
      ].map(s => `
        <div style="background:#fafaf8;border:1px solid #e8e4dc;border-radius:10px;padding:14px 16px;">
          <div style="font-size:10.5px;color:#888;margin-bottom:6px;">${s.label}</div>
          <div style="font-size:18px;font-weight:800;color:${s.color};">${s.value}</div>
        </div>
      `).join('')}
    </div>

    <div style="background:#fffdf5;border:1px solid #f5a623;border-radius:12px;padding:24px 28px;margin-bottom:32px;">
      <div style="font-size:11px;color:#b5760a;font-weight:700;letter-spacing:0.5px;margin-bottom:12px;">
        ✦ AI 추천 요약
      </div>
      <div style="font-size:13.5px;line-height:1.85;color:#2a2a2a;white-space:pre-wrap;">${summaryText}</div>
    </div>

    <div style="font-size:10px;color:#bbb;border-top:1px solid #eee;padding-top:12px;line-height:1.6;">
      본 리포트는 참고용 정보이며, 투자 최종 결정 및 결과에 대한 책임은 투자자 본인에게 있습니다.
      금융상품 가입 전 반드시 상품설명서와 약관을 확인하시기 바랍니다.
    </div>
  `;

  document.body.appendChild(div);

  // 브라우저 레이아웃 계산이 끝날 때까지 대기
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));

  const canvas = await html2canvas(div, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // 오프스크린 요소도 캡처하도록 scrollX/scrollY 보정
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    width: div.offsetWidth,
    height: div.offsetHeight,
  });

  document.body.removeChild(div);
  return canvas;
}


/**
 * PDF 1페이지에 canvas 이미지를 꽉 차게 넣는다.
 * 높이가 A4를 초과하면 여러 페이지에 나눠 넣는다.
 */
function addCanvasToPdf(pdf, canvas, isFirst = false) {
  const mmPerPx = PAGE_W / canvas.width; // canvas는 scale:2 이므로 실제 mm 변환
  const imgW = PAGE_W;
  const imgH = canvas.height * mmPerPx;

  let remainY = 0;
  let pageContentH = PAGE_H - MARGIN * 2;
  let sliceH = pageContentH / mmPerPx; // px 단위로 한 페이지에 들어갈 높이

  let yPx = 0;

  while (yPx < canvas.height) {
    if (!isFirst) pdf.addPage();
    isFirst = false;

    const slice = document.createElement('canvas');
    const actualSliceH = Math.min(sliceH, canvas.height - yPx);
    slice.width = canvas.width;
    slice.height = actualSliceH;
    const ctx = slice.getContext('2d');
    ctx.drawImage(canvas, 0, yPx, canvas.width, actualSliceH, 0, 0, canvas.width, actualSliceH);

    const imgData = slice.toDataURL('image/jpeg', 0.92);
    const sliceMmH = actualSliceH * mmPerPx;
    pdf.addImage(imgData, 'JPEG', 0, MARGIN, imgW, sliceMmH);

    yPx += sliceH;
  }
}

/**
 * 추천 결과를 PDF로 내보낸다.
 *
 * @param {object} params
 * @param {string}  params.summaryText   - OpenAI 요약 텍스트
 * @param {object}  params.meta          - { investAmount, remainingCash, monthlyNeed, riskLabel }
 * @param {Array}   params.sectionEls    - [{ code, el }] 기간 섹션 DOM 요소 배열
 */
export async function exportRecommendationPdf({ summaryText, meta, sectionEls }) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  // 1페이지: AI 요약
  const summaryCanvas = await renderSummaryPage(summaryText, meta);
  addCanvasToPdf(pdf, summaryCanvas, true);

  // 2페이지~: 기간별 섹션 캡처
  for (const { el } of sectionEls) {
    if (!el) continue;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    addCanvasToPdf(pdf, canvas, false);
  }

  // 다운로드
  const filename = `금융상품추천_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}
