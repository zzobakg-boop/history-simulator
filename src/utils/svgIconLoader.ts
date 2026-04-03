/**
 * SVG 스프라이트 시트에서 각 symbol을 Canvas로 렌더링하여
 * Phaser 텍스처로 등록하는 유틸리티
 */

/** 로드할 아이콘 ID 목록 */
const ICON_IDS = [
  // 문명 아이콘
  'icon-mesopotamia',
  'icon-egypt',
  'icon-indus',
  'icon-china',
  // 자원 아이콘
  'icon-food',
  'icon-gold',
  'icon-culture',
  'icon-military',
  'icon-technology',
  // UI 아이콘
  'icon-defense',
  'icon-agriculture',
  'icon-commerce',
  'icon-population',
];

/** 문명 ID → 아이콘 텍스처 키 매핑 */
export const FACTION_ICON_MAP: Record<string, string> = {
  mesopotamia: 'icon-mesopotamia',
  egypt: 'icon-egypt',
  indus: 'icon-indus',
  yellow_river: 'icon-china',
};

/** 자원 이름 → 아이콘 텍스처 키 매핑 */
export const RESOURCE_ICON_MAP: Record<string, string> = {
  food: 'icon-food',
  gold: 'icon-gold',
  culture: 'icon-culture',
  military: 'icon-military',
  technology: 'icon-technology',
};

/**
 * icons.svg를 fetch하고 각 symbol을 64×64 Canvas에 렌더링 후
 * Phaser 텍스처 매니저에 등록한다.
 */
export async function loadSvgIcons(
  textures: Phaser.Textures.TextureManager,
  basePath: string,
): Promise<void> {
  const url = `${basePath}icons.svg`;
  const response = await fetch(url);
  const svgText = await response.text();

  // SVG 문서 파싱
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

  const promises = ICON_IDS.map((id) => renderSymbolToTexture(svgDoc, id, textures));
  await Promise.all(promises);
}

/** 단일 symbol을 Canvas에 렌더링하여 텍스처로 등록 */
function renderSymbolToTexture(
  svgDoc: Document,
  symbolId: string,
  textures: Phaser.Textures.TextureManager,
): Promise<void> {
  return new Promise((resolve) => {
    const symbol = svgDoc.getElementById(symbolId);
    if (!symbol) {
      console.warn(`SVG symbol '${symbolId}' 을(를) 찾을 수 없습니다`);
      resolve();
      return;
    }

    const size = 64;

    // symbol 내용을 독립 SVG로 감싼다
    const svgNS = 'http://www.w3.org/2000/svg';
    const wrapperSvg = document.createElementNS(svgNS, 'svg');
    wrapperSvg.setAttribute('xmlns', svgNS);
    wrapperSvg.setAttribute('width', String(size));
    wrapperSvg.setAttribute('height', String(size));
    wrapperSvg.setAttribute('viewBox', symbol.getAttribute('viewBox') ?? '0 0 64 64');

    // symbol의 자식 노드를 복사
    for (const child of Array.from(symbol.childNodes)) {
      wrapperSvg.appendChild(child.cloneNode(true));
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(wrapperSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const urlObject = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(urlObject);

      // Phaser 텍스처 등록
      if (!textures.exists(symbolId)) {
        textures.addCanvas(symbolId, canvas);
      }
      resolve();
    };
    img.onerror = () => {
      console.warn(`SVG 아이콘 '${symbolId}' 렌더링 실패`);
      URL.revokeObjectURL(urlObject);
      resolve();
    };
    img.src = urlObject;
  });
}
