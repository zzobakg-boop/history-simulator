import { n as __toESM } from "./rolldown-runtime-BELLtifV.js";
import { t as require_phaser } from "./phaser-BpsWc7Sg.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/utils/svgIconLoader.ts
var import_phaser = /* @__PURE__ */ __toESM(require_phaser(), 1);
/**
* SVG 스프라이트 시트에서 각 symbol을 Canvas로 렌더링하여
* Phaser 텍스처로 등록하는 유틸리티
*/
/** 로드할 아이콘 ID 목록 */
var ICON_IDS = [
	"icon-mesopotamia",
	"icon-egypt",
	"icon-indus",
	"icon-china",
	"icon-food",
	"icon-gold",
	"icon-culture",
	"icon-military",
	"icon-technology",
	"icon-defense",
	"icon-agriculture",
	"icon-commerce",
	"icon-population"
];
/** 문명 ID → 아이콘 텍스처 키 매핑 */
var FACTION_ICON_MAP = {
	mesopotamia: "icon-mesopotamia",
	egypt: "icon-egypt",
	indus: "icon-indus",
	yellow_river: "icon-china"
};
/** 자원 이름 → 아이콘 텍스처 키 매핑 */
var RESOURCE_ICON_MAP = {
	food: "icon-food",
	gold: "icon-gold",
	culture: "icon-culture",
	military: "icon-military",
	technology: "icon-technology"
};
/**
* icons.svg를 fetch하고 각 symbol을 64×64 Canvas에 렌더링 후
* Phaser 텍스처 매니저에 등록한다.
*/
async function loadSvgIcons(textures, basePath) {
	const url = `${basePath}icons.svg`;
	const svgText = await (await fetch(url)).text();
	const svgDoc = new DOMParser().parseFromString(svgText, "image/svg+xml");
	const promises = ICON_IDS.map((id) => renderSymbolToTexture(svgDoc, id, textures));
	await Promise.all(promises);
}
/** 단일 symbol을 Canvas에 렌더링하여 텍스처로 등록 */
function renderSymbolToTexture(svgDoc, symbolId, textures) {
	return new Promise((resolve) => {
		const symbol = svgDoc.getElementById(symbolId);
		if (!symbol) {
			console.warn(`SVG symbol '${symbolId}' 을(를) 찾을 수 없습니다`);
			resolve();
			return;
		}
		const size = 64;
		const svgNS = "http://www.w3.org/2000/svg";
		const wrapperSvg = document.createElementNS(svgNS, "svg");
		wrapperSvg.setAttribute("xmlns", svgNS);
		wrapperSvg.setAttribute("width", String(size));
		wrapperSvg.setAttribute("height", String(size));
		wrapperSvg.setAttribute("viewBox", symbol.getAttribute("viewBox") ?? "0 0 64 64");
		for (const child of Array.from(symbol.childNodes)) wrapperSvg.appendChild(child.cloneNode(true));
		const svgString = new XMLSerializer().serializeToString(wrapperSvg);
		const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
		const urlObject = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = size;
			canvas.height = size;
			canvas.getContext("2d").drawImage(img, 0, 0, size, size);
			URL.revokeObjectURL(urlObject);
			if (!textures.exists(symbolId)) textures.addCanvas(symbolId, canvas);
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
//#endregion
//#region src/scenes/BootScene.ts
var BootScene = class extends import_phaser.default.Scene {
	constructor() {
		super({ key: "BootScene" });
	}
	preload() {
		const { width, height } = this.cameras.main;
		this.add.rectangle(width / 2, height / 2, 400, 30, 3355477);
		const fill = this.add.rectangle(width / 2 - 198, height / 2, 4, 26, 15777856);
		this.load.on("progress", (value) => {
			fill.width = 396 * value;
			fill.x = width / 2 - 198 + fill.width / 2;
		});
		this.add.text(width / 2, height / 2 - 50, "🏛️ 역사 전략 시뮬레이터", {
			fontSize: "28px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.add.text(width / 2, height / 2 + 50, "로딩 중...", {
			fontSize: "16px",
			color: "#aaaaaa",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
	}
	create() {
		loadSvgIcons(this.textures, "/history-simulator/").then(() => {
			this.scene.start("TitleScene");
		});
	}
};
//#endregion
//#region src/data/scenario_civilizations.ts
/**
* 시나리오: 4대 문명의 경쟁
* 교과서: 역사① Ⅰ단원 "문명의 발생과 고대 세계의 형성"
*/
var SCENARIO_CIVILIZATIONS = {
	id: "four-civilizations",
	title: "4대 문명의 경쟁",
	subtitle: "강 유역에서 시작된 인류 최초의 문명들",
	textbookUnit: "Ⅰ. 문명의 발생과 고대 세계의 형성",
	startYear: -3500,
	endYear: -500,
	turnYears: 100,
	factions: [
		{
			id: "mesopotamia",
			name: "메소포타미아",
			color: 13935988,
			isPlayer: false,
			resources: {
				food: 60,
				gold: 40,
				culture: 50,
				military: 30,
				technology: 50
			},
			territories: [
				"ur",
				"babylon",
				"nineveh"
			],
			leaders: [{
				id: "hammurabi",
				name: "함무라비",
				stats: {
					leadership: 85,
					military: 60,
					diplomacy: 70,
					culture: 80,
					intelligence: 90
				},
				role: "ruler"
			}]
		},
		{
			id: "egypt",
			name: "이집트",
			color: 15777856,
			isPlayer: false,
			resources: {
				food: 70,
				gold: 50,
				culture: 60,
				military: 40,
				technology: 40
			},
			territories: [
				"memphis",
				"thebes",
				"alexandria"
			],
			leaders: [{
				id: "pharaoh",
				name: "파라오 (쿠푸)",
				stats: {
					leadership: 80,
					military: 50,
					diplomacy: 60,
					culture: 90,
					intelligence: 70
				},
				role: "ruler"
			}]
		},
		{
			id: "indus",
			name: "인더스",
			color: 6336608,
			isPlayer: false,
			resources: {
				food: 50,
				gold: 60,
				culture: 40,
				military: 20,
				technology: 60
			},
			territories: ["harappa", "mohenjo-daro"],
			leaders: [{
				id: "indus_leader",
				name: "도시 장로",
				stats: {
					leadership: 60,
					military: 30,
					diplomacy: 80,
					culture: 70,
					intelligence: 75
				},
				role: "ruler"
			}]
		},
		{
			id: "yellow_river",
			name: "황허 문명",
			color: 14700624,
			isPlayer: false,
			resources: {
				food: 65,
				gold: 35,
				culture: 45,
				military: 50,
				technology: 45
			},
			territories: [
				"anyang",
				"luoyang",
				"xian"
			],
			leaders: [{
				id: "shang_king",
				name: "상(商)왕",
				stats: {
					leadership: 75,
					military: 70,
					diplomacy: 50,
					culture: 60,
					intelligence: 65
				},
				role: "ruler"
			}]
		}
	],
	territories: [
		{
			id: "ur",
			name: "우르",
			x: 440,
			y: 400,
			owner: "mesopotamia",
			population: 3e4,
			development: {
				agriculture: 70,
				commerce: 50,
				defense: 40
			},
			garrison: 2e3,
			adjacentTo: ["babylon", "memphis"]
		},
		{
			id: "babylon",
			name: "바빌론",
			x: 410,
			y: 280,
			owner: "mesopotamia",
			population: 4e4,
			development: {
				agriculture: 80,
				commerce: 60,
				defense: 50
			},
			garrison: 3e3,
			adjacentTo: ["ur", "nineveh"]
		},
		{
			id: "nineveh",
			name: "니네베",
			x: 480,
			y: 170,
			owner: "mesopotamia",
			population: 25e3,
			development: {
				agriculture: 60,
				commerce: 40,
				defense: 60
			},
			garrison: 2500,
			adjacentTo: ["babylon", "harappa"]
		},
		{
			id: "memphis",
			name: "멤피스",
			x: 180,
			y: 250,
			owner: "egypt",
			population: 35e3,
			development: {
				agriculture: 85,
				commerce: 45,
				defense: 35
			},
			garrison: 2e3,
			adjacentTo: [
				"thebes",
				"alexandria",
				"ur"
			]
		},
		{
			id: "thebes",
			name: "테베",
			x: 150,
			y: 380,
			owner: "egypt",
			population: 3e4,
			development: {
				agriculture: 75,
				commerce: 55,
				defense: 30
			},
			garrison: 1500,
			adjacentTo: ["memphis", "alexandria"]
		},
		{
			id: "alexandria",
			name: "알렉산드리아",
			x: 240,
			y: 160,
			owner: "egypt",
			population: 2e4,
			development: {
				agriculture: 50,
				commerce: 70,
				defense: 40
			},
			garrison: 1e3,
			adjacentTo: ["memphis", "thebes"]
		},
		{
			id: "harappa",
			name: "하라파",
			x: 670,
			y: 220,
			owner: "indus",
			population: 25e3,
			development: {
				agriculture: 65,
				commerce: 60,
				defense: 25
			},
			garrison: 1e3,
			adjacentTo: ["mohenjo-daro", "nineveh"]
		},
		{
			id: "mohenjo-daro",
			name: "모헨조다로",
			x: 700,
			y: 380,
			owner: "indus",
			population: 3e4,
			development: {
				agriculture: 70,
				commerce: 65,
				defense: 30
			},
			garrison: 1200,
			adjacentTo: ["harappa", "xian"]
		},
		{
			id: "anyang",
			name: "안양(殷墟)",
			x: 890,
			y: 180,
			owner: "yellow_river",
			population: 28e3,
			development: {
				agriculture: 60,
				commerce: 35,
				defense: 50
			},
			garrison: 2500,
			adjacentTo: ["luoyang", "xian"]
		},
		{
			id: "luoyang",
			name: "뤄양",
			x: 920,
			y: 320,
			owner: "yellow_river",
			population: 32e3,
			development: {
				agriculture: 70,
				commerce: 40,
				defense: 45
			},
			garrison: 2e3,
			adjacentTo: ["anyang", "xian"]
		},
		{
			id: "xian",
			name: "시안(호경)",
			x: 850,
			y: 440,
			owner: "yellow_river",
			population: 22e3,
			development: {
				agriculture: 55,
				commerce: 30,
				defense: 55
			},
			garrison: 1800,
			adjacentTo: [
				"anyang",
				"luoyang",
				"mohenjo-daro"
			]
		}
	],
	events: [
		{
			id: "irrigation_development",
			triggerTurn: 1,
			title: "🌾 관개 기술의 발전",
			description: "강 유역의 문명들이 물을 다스리는 기술을 발전시켰습니다.\n\n교과서: \"큰 강 유역에서는 관개 농업이 발달하면서 잉여 생산물이 생겨났고, 이를 바탕으로 도시가 형성되었다.\"",
			textbookRef: "Ⅰ-1. 문명의 발생",
			choices: [{
				text: "대규모 관개 수로를 건설한다",
				effect: {
					food: 25,
					technology: 10,
					gold: -5
				},
				resultText: "농업 생산량이 비약적으로 증가하여 인구가 늘어났습니다!"
			}, {
				text: "기존 수로를 효율적으로 정비한다",
				effect: {
					food: 15,
					gold: 10
				},
				resultText: "안정적인 식량 공급이 이루어졌습니다."
			}],
			triggered: false
		},
		{
			id: "writing_invention",
			triggerTurn: 2,
			title: "📜 문자의 발명",
			description: "메소포타미아에서 쐐기 문자가, 이집트에서 상형 문자가 만들어졌습니다.\n\n교과서: \"문자의 발명으로 기록이 가능해지면서 법률, 종교, 과학 등이 발달하였다.\"",
			textbookRef: "Ⅰ-1. 문명의 발생",
			choices: [{
				text: "문자 교육에 투자한다",
				effect: {
					culture: 20,
					technology: 15
				},
				resultText: "문화력과 기술력이 크게 상승했습니다!"
			}, {
				text: "군사 기록에 활용한다",
				effect: {
					military: 15,
					technology: 10
				},
				resultText: "군사 전략이 체계화되었습니다."
			}],
			triggered: false
		},
		{
			id: "pyramid_building",
			triggerTurn: 3,
			title: "🏛️ 피라미드 건설",
			description: "이집트에서 거대한 피라미드 건설이 시작되었습니다.\n\n교과서: \"피라미드는 파라오의 강력한 왕권을 보여 주며, 높은 수준의 건축 기술과 수학적 지식을 반영한다.\"",
			textbookRef: "Ⅰ-1. 이집트 문명",
			choices: [{
				text: "대규모 피라미드를 건설한다",
				effect: {
					culture: 30,
					food: -15,
					gold: -10
				},
				resultText: "후세에 길이 남을 위대한 건축물이 완성되었습니다!"
			}, {
				text: "규모를 줄이고 관개 시설에 투자한다",
				effect: {
					food: 20,
					culture: 10
				},
				resultText: "농업 생산량이 크게 증가했습니다."
			}],
			triggered: false
		},
		{
			id: "indus_urban_planning",
			triggerTurn: 4,
			title: "🏙️ 계획 도시 건설",
			description: "인더스 문명에서 놀라울 정도로 정교한 도시 계획이 이루어졌습니다.\n\n교과서: \"모헨조다로는 바둑판 모양의 도로, 상하수도 시설 등 뛰어난 도시 계획을 보여 준다.\"",
			textbookRef: "Ⅰ-1. 인더스 문명",
			choices: [{
				text: "하수도 시스템을 더 확장한다",
				effect: {
					technology: 20,
					culture: 10
				},
				resultText: "위생 환경이 개선되어 인구가 증가했습니다!"
			}, {
				text: "교역 항구를 건설한다",
				effect: {
					gold: 25,
					technology: 5
				},
				resultText: "해상 교역이 활성화되었습니다."
			}],
			triggered: false
		},
		{
			id: "hammurabi_code",
			triggerTurn: 5,
			title: "⚖️ 함무라비 법전",
			description: "바빌로니아의 함무라비 왕이 282조의 법전을 만들었습니다.\n\n교과서: \"함무라비 법전은 현존하는 가장 오래된 성문법 중 하나로, 사회 질서를 유지하기 위해 만들어졌다.\"",
			textbookRef: "Ⅰ-1. 메소포타미아 문명",
			choices: [{
				text: "법을 엄격하게 적용한다",
				effect: {
					gold: 10,
					military: 10,
					culture: -5
				},
				resultText: "질서가 잡혔지만 백성들의 불만도 생겼습니다."
			}, {
				text: "법을 통해 교역을 촉진한다",
				effect: {
					gold: 20,
					culture: 10
				},
				resultText: "상업이 크게 발달했습니다!"
			}],
			triggered: false
		},
		{
			id: "ziggurat_construction",
			triggerTurn: 7,
			title: "🛕 지구라트 건설",
			description: "메소포타미아의 도시들에 거대한 신전 탑 지구라트가 세워졌습니다.\n\n교과서: \"메소포타미아 사람들은 다신교를 믿었으며, 도시마다 수호신을 모시는 신전인 지구라트를 세웠다.\"",
			textbookRef: "Ⅰ-1. 메소포타미아 문명",
			choices: [{
				text: "도시마다 거대한 지구라트를 세운다",
				effect: {
					culture: 25,
					gold: -10,
					food: -5
				},
				resultText: "신관 계급이 강화되고 종교 문화가 번성했습니다!"
			}, {
				text: "작은 규모로 짓고 남은 자원을 비축한다",
				effect: {
					culture: 10,
					gold: 10
				},
				resultText: "실용적인 판단으로 도시 재정이 안정되었습니다."
			}],
			triggered: false
		},
		{
			id: "bronze_age",
			triggerTurn: 8,
			title: "⚒️ 청동기의 보급",
			description: "청동 도구와 무기가 널리 보급되면서 사회에 큰 변화가 일어났습니다.\n\n교과서: \"청동기의 사용으로 농업 생산력이 높아지고, 강력한 무기를 가진 지배 계급이 등장하여 계급 사회가 형성되었다.\"",
			textbookRef: "Ⅰ-1. 문명의 발생",
			choices: [{
				text: "청동 무기 생산에 집중한다",
				effect: {
					military: 25,
					technology: 10
				},
				resultText: "강력한 군대를 갖추어 주변 세력을 압도했습니다!"
			}, {
				text: "청동 농기구 보급에 집중한다",
				effect: {
					food: 20,
					technology: 10
				},
				resultText: "농업 생산력이 크게 향상되었습니다."
			}],
			triggered: false
		},
		{
			id: "nile_flood_astronomy",
			triggerTurn: 9,
			title: "🌊 나일강 범람과 천문학",
			description: "이집트인들이 나일강의 주기적 범람을 예측하기 위해 천문학을 발전시켰습니다.\n\n교과서: \"이집트인들은 나일강의 범람 시기를 알기 위해 천문학을 발달시켰고, 태양력을 만들었다.\"",
			textbookRef: "Ⅰ-1. 이집트 문명",
			choices: [{
				text: "태양력 체계를 확립하고 보급한다",
				effect: {
					technology: 20,
					culture: 15
				},
				resultText: "정확한 달력으로 농사 시기를 예측할 수 있게 되었습니다!"
			}, {
				text: "범람 시기에 맞춘 대규모 경작지를 개발한다",
				effect: {
					food: 25,
					gold: 5
				},
				resultText: "비옥한 토양을 최대한 활용하여 풍요를 누렸습니다."
			}],
			triggered: false
		},
		{
			id: "oracle_bone_script",
			triggerTurn: 10,
			title: "🦴 갑골 문자와 점술",
			description: "황허 문명의 상(殷)나라에서 거북의 등껍질과 소의 뼈에 글자를 새겨 점을 쳤습니다.\n\n교과서: \"상(은)은 갑골에 문자를 새겨 점을 치는 신권 정치를 하였다.\"",
			textbookRef: "Ⅰ-1. 황허 문명",
			choices: [{
				text: "점술을 국가 의사 결정에 적극 활용한다",
				effect: {
					culture: 20,
					military: 10
				},
				resultText: "신권 정치가 강화되어 왕의 권위가 높아졌습니다!"
			}, {
				text: "갑골 문자를 기록 체계로 발전시킨다",
				effect: {
					technology: 20,
					culture: 10
				},
				resultText: "문자 체계가 정교해져 행정이 효율화되었습니다."
			}],
			triggered: false
		},
		{
			id: "maritime_trade_network",
			triggerTurn: 12,
			title: "⛵ 해상 교역망 형성",
			description: "메소포타미아와 인더스 문명 사이에 활발한 해상 교역로가 열렸습니다.\n\n교과서: \"메소포타미아와 인더스 문명은 해상 교역을 통해 서로 영향을 주고받았다.\"",
			textbookRef: "Ⅰ-1. 문명 간 교류",
			choices: [{
				text: "대규모 무역 선단을 조직한다",
				effect: {
					gold: 30,
					technology: 10,
					military: -5
				},
				resultText: "원거리 교역으로 막대한 부를 축적했습니다!"
			}, {
				text: "교역품의 품질을 높여 수출한다",
				effect: {
					gold: 15,
					culture: 15
				},
				resultText: "문명의 명성이 교역로를 따라 퍼져나갔습니다."
			}],
			triggered: false
		},
		{
			id: "polytheism_to_monotheism",
			triggerTurn: 14,
			title: "🙏 종교의 발전",
			description: "각 문명에서 다양한 종교가 발달하고 있습니다. 자연 현상에 대한 경외심에서 시작된 다신교가 체계화되었습니다.\n\n교과서: \"고대 문명에서는 자연 현상을 신격화한 다신교가 일반적이었으며, 이후 일신교의 흐름도 나타났다.\"",
			textbookRef: "Ⅰ-1. 고대 세계의 종교",
			choices: [{
				text: "신관 계급을 강화하여 종교를 체계화한다",
				effect: {
					culture: 25,
					military: 5,
					gold: -5
				},
				resultText: "종교가 사회 통합의 핵심 수단이 되었습니다!"
			}, {
				text: "다양한 신앙을 허용하여 교류를 촉진한다",
				effect: {
					culture: 15,
					gold: 15
				},
				resultText: "종교적 관용으로 다른 문명과의 교류가 활발해졌습니다."
			}],
			triggered: false
		},
		{
			id: "caste_system",
			triggerTurn: 15,
			title: "🔺 카스트 제도의 형성",
			description: "인더스 문명이 쇠퇴한 뒤, 아리아인이 들어오면서 엄격한 신분 제도가 만들어졌습니다.\n\n교과서: \"아리아인은 카스트라는 엄격한 신분 제도를 만들어 브라만(사제), 크샤트리아(무사), 바이샤(평민), 수드라(노예) 등으로 나누었다.\"",
			textbookRef: "Ⅰ-1. 인도의 고대 문명",
			choices: [{
				text: "카스트 제도를 도입하여 사회를 안정시킨다",
				effect: {
					military: 15,
					culture: 10,
					food: -5
				},
				resultText: "사회 질서가 확립되었지만 하층민의 불만이 쌓였습니다."
			}, {
				text: "기존 인더스 전통을 유지하며 신분을 유연하게 한다",
				effect: {
					culture: 15,
					gold: 10
				},
				resultText: "다양한 계층의 교류로 상업이 발달했습니다."
			}],
			triggered: false
		},
		{
			id: "indus_decline",
			triggerTurn: 17,
			title: "💨 인더스 문명의 쇠퇴",
			description: "한때 번성했던 인더스 문명이 급격히 쇠퇴하기 시작합니다.\n\n교과서: \"인더스 문명은 기원전 1500년경 급격히 쇠퇴하였는데, 기후 변화, 홍수, 외부 세력의 침입 등이 원인으로 추정된다.\"",
			textbookRef: "Ⅰ-1. 인더스 문명",
			choices: [{
				text: "새로운 정착지를 찾아 이주한다",
				effect: {
					food: 10,
					technology: 5,
					military: -10
				},
				resultText: "갠지스강 유역으로 이주하여 새로운 터전을 마련했습니다."
			}, {
				text: "도시를 재건하고 방어를 강화한다",
				effect: {
					military: 15,
					gold: -10
				},
				resultText: "도시를 지키기 위해 자원을 집중했습니다."
			}],
			triggered: false
		},
		{
			id: "shang_to_zhou",
			triggerTurn: 19,
			title: "⚔️ 은(殷) 멸망과 주(周) 건국",
			description: "주(周)나라 무왕이 은(상)나라를 무너뜨리고 새 왕조를 세웠습니다.\n\n교과서: \"주(周)는 봉건제를 실시하여 왕족과 공신에게 토지를 나누어 다스리게 하였다.\"",
			textbookRef: "Ⅰ-1. 황허 문명",
			choices: [{
				text: "봉건제를 도입하여 영토를 나눠 다스린다",
				effect: {
					gold: 15,
					culture: 15,
					military: -5
				},
				resultText: "봉건제로 광대한 영토를 효과적으로 통치했습니다!"
			}, {
				text: "중앙집권을 강화하여 왕권을 높인다",
				effect: {
					military: 20,
					culture: 5,
					gold: -5
				},
				resultText: "강력한 왕권으로 신속한 의사 결정이 가능해졌습니다."
			}],
			triggered: false
		},
		{
			id: "phoenician_alphabet",
			triggerTurn: 20,
			title: "🔤 페니키아 알파벳의 전파",
			description: "지중해 동쪽 해안의 페니키아 상인들이 간편한 표음 문자 알파벳을 만들어 퍼뜨렸습니다.\n\n교과서: \"페니키아인들은 알파벳을 만들었는데, 이것이 그리스를 거쳐 오늘날 로마자(라틴 문자)의 기원이 되었다.\"",
			textbookRef: "Ⅰ-1. 지중해 문명",
			choices: [{
				text: "알파벳을 도입하여 행정 효율을 높인다",
				effect: {
					technology: 20,
					culture: 10
				},
				resultText: "간편한 문자 체계로 문서 행정이 혁신되었습니다!"
			}, {
				text: "기존 문자 전통을 고수한다",
				effect: {
					culture: 15,
					military: 5
				},
				resultText: "전통 문자의 깊이가 더해져 문화적 정체성이 강화되었습니다."
			}],
			triggered: false
		},
		{
			id: "iron_age",
			triggerTurn: 22,
			title: "🗡️ 철기 시대의 도래",
			description: "히타이트가 독점하던 철기 제조 기술이 각지로 퍼져나갔습니다.\n\n교과서: \"철기의 보급으로 농업 생산력이 더욱 높아졌고, 강력한 무기를 갖춘 대제국이 등장하는 배경이 되었다.\"",
			textbookRef: "Ⅰ-1. 고대 세계의 변화",
			choices: [{
				text: "철제 무기 대량 생산에 착수한다",
				effect: {
					military: 30,
					technology: 15,
					gold: -10
				},
				resultText: "철기 군대로 주변 세력을 압도했습니다!"
			}, {
				text: "철제 농기구를 보급한다",
				effect: {
					food: 25,
					technology: 10
				},
				resultText: "농업 혁명으로 인구가 급증했습니다."
			}],
			triggered: false
		},
		{
			id: "grand_trade_route",
			triggerTurn: 26,
			title: "🐫 대규모 교역로 완성",
			description: "4대 문명을 잇는 교역로가 체계화되어 물자와 문화가 활발히 오갔습니다.\n\n교과서: \"고대 문명들은 교역을 통해 서로 영향을 주고받으며 발전하였다.\"",
			textbookRef: "Ⅰ-1. 문명 간 교류",
			choices: [{
				text: "교역 거점 도시를 대대적으로 육성한다",
				effect: {
					gold: 30,
					culture: 10
				},
				resultText: "교역 중심지로 성장하여 엄청난 부를 축적했습니다!"
			}, {
				text: "교역로 경비를 강화하여 안전을 확보한다",
				effect: {
					military: 15,
					gold: 15
				},
				resultText: "안전한 교역로로 상인들이 몰려들었습니다."
			}],
			triggered: false
		}
	],
	victoryConditions: [
		{
			type: "culture",
			description: "문화력 200 이상 달성",
			check: "culture >= 200"
		},
		{
			type: "conquest",
			description: "전체 영토의 60% 이상 지배",
			check: "territories >= 60%"
		},
		{
			type: "technology",
			description: "기술력 150 이상 달성",
			check: "technology >= 150"
		}
	]
};
//#endregion
//#region src/scenes/TitleScene.ts
var TitleScene = class extends import_phaser.default.Scene {
	selectedFactionId = SCENARIO_CIVILIZATIONS.factions[0].id;
	startButton;
	factionCards = /* @__PURE__ */ new Map();
	constructor() {
		super({ key: "TitleScene" });
	}
	create() {
		const { width, height } = this.scale;
		this.cameras.main.setBackgroundColor("#0d1b2a");
		this.drawBackground(width, height);
		this.drawHeader(width);
		this.drawScenarioSelector(width);
		this.drawFactionSelection();
		this.drawStartButton(width, height);
	}
	drawBackground(width, height) {
		const graphics = this.add.graphics();
		graphics.fillGradientStyle(528669, 858922, 1254460, 594204, 1, 1, 1, 1);
		graphics.fillRect(0, 0, width, height);
		graphics.fillStyle(15777856, .08);
		graphics.fillEllipse(width * .22, height * .28, 320, 220);
		graphics.fillEllipse(width * .77, height * .72, 360, 260);
		graphics.lineStyle(1, 15777856, .12);
		for (let x = 110; x < width; x += 180) graphics.strokeLineShape(new import_phaser.default.Geom.Line(x, 90, x - 90, height - 60));
	}
	drawHeader(width) {
		this.add.text(width / 2, 72, "🏛️ 역사 전략 시뮬레이터", {
			fontSize: "42px",
			color: "#f0c040",
			fontFamily: "Georgia, serif",
			stroke: "#000000",
			strokeThickness: 4
		}).setOrigin(.5);
		this.add.text(width / 2, 116, "강 유역 문명을 골라 고대 세계의 주도권을 쥐십시오", {
			fontSize: "16px",
			color: "#b8c4d4",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
	}
	drawScenarioSelector(width) {
		this.add.text(130, 166, "시나리오 선택", {
			fontSize: "18px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		});
		const button = this.add.container(width / 2, 216);
		const bg = this.add.rectangle(0, 0, 1040, 76, 1450302, .95).setStrokeStyle(2, 15777856, .8).setInteractive({ useHandCursor: true });
		const title = this.add.text(-490, -14, "4대 문명의 경쟁", {
			fontSize: "24px",
			color: "#ffffff",
			fontFamily: "Georgia, serif"
		});
		const subtitle = this.add.text(-490, 15, SCENARIO_CIVILIZATIONS.subtitle, {
			fontSize: "13px",
			color: "#9eb0c8",
			fontFamily: "sans-serif"
		});
		const unit = this.add.text(470, 0, SCENARIO_CIVILIZATIONS.textbookUnit, {
			fontSize: "12px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(1, .5);
		bg.on("pointerover", () => bg.setFillStyle(1912146, .98));
		bg.on("pointerout", () => bg.setFillStyle(1450302, .95));
		button.add([
			bg,
			title,
			subtitle,
			unit
		]);
	}
	drawFactionSelection() {
		this.add.text(130, 290, "세력 선택", {
			fontSize: "18px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		});
		const metaByFactionId = {
			mesopotamia: {
				subtitle: "도시 국가 연맹",
				trait: "문자와 법, 비옥한 초승달 지대"
			},
			egypt: {
				subtitle: "나일의 왕국",
				trait: "안정적 농업, 거대 건축, 신권 정치"
			},
			indus: {
				subtitle: "계획 도시 문명",
				trait: "정교한 도시 설계, 위생, 교역"
			},
			yellow_river: {
				subtitle: "황허 유역 국가",
				trait: "청동 문화, 제사, 군사 동원"
			}
		};
		const startX = 185;
		const gap = 230;
		const y = 470;
		SCENARIO_CIVILIZATIONS.factions.forEach((faction, index) => {
			const meta = metaByFactionId[faction.id];
			const card = this.createFactionCard(startX + gap * index, y, faction, meta);
			this.factionCards.set(faction.id, card);
		});
		this.refreshFactionCards();
	}
	createFactionCard(x, y, faction, meta) {
		const card = this.add.container(x, y);
		const accent = import_phaser.default.Display.Color.IntegerToColor(faction.color).brighten(25).color;
		const bg = this.add.rectangle(0, 0, 210, 250, 1056826, .95).setStrokeStyle(2, 3690606, 1).setInteractive({ useHandCursor: true });
		const banner = this.add.rectangle(0, -92, 182, 42, accent, .92).setStrokeStyle(1, 16244401, .45);
		const emblem = this.add.circle(0, -28, 26, accent, .22).setStrokeStyle(2, accent, .95);
		const iconKey = FACTION_ICON_MAP[faction.id];
		let civIcon = null;
		if (iconKey && this.textures.exists(iconKey)) civIcon = this.add.image(0, -28, iconKey).setDisplaySize(40, 40);
		const name = this.add.text(0, -93, faction.name, {
			fontSize: "20px",
			color: "#08111d",
			fontFamily: "Georgia, serif"
		}).setOrigin(.5);
		const subtitle = this.add.text(0, -53, meta.subtitle, {
			fontSize: "12px",
			color: "#b9c5d5",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		const leader = this.add.text(0, 6, `리더  ${faction.leaders[0]?.name ?? "미상"}`, {
			fontSize: "14px",
			color: "#f8f1dc",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		const trait = this.add.text(0, 56, `특성  ${meta.trait}`, {
			fontSize: "13px",
			color: "#8ea5c1",
			fontFamily: "sans-serif",
			align: "center",
			wordWrap: { width: 170 },
			lineSpacing: 4
		}).setOrigin(.5);
		const resources = this.add.text(0, 104, [
			`식량 ${faction.resources.food}  재화 ${faction.resources.gold}`,
			`문화 ${faction.resources.culture}  군사 ${faction.resources.military}`,
			`기술 ${faction.resources.technology}`
		].join("\n"), {
			fontSize: "12px",
			color: "#d3dbe8",
			fontFamily: "monospace",
			align: "center",
			lineSpacing: 5
		}).setOrigin(.5);
		bg.on("pointerover", () => {
			if (this.selectedFactionId !== faction.id) bg.setFillStyle(1585238, .98);
			card.setScale(1.02);
		});
		bg.on("pointerout", () => {
			this.refreshFactionCards();
			card.setScale(this.selectedFactionId === faction.id ? 1.02 : 1);
		});
		bg.on("pointerdown", () => {
			this.selectedFactionId = faction.id;
			this.refreshFactionCards();
		});
		const elements = [
			bg,
			banner,
			emblem
		];
		if (civIcon) elements.push(civIcon);
		elements.push(name, subtitle, leader, trait, resources);
		card.add(elements);
		return card;
	}
	refreshFactionCards() {
		for (const faction of SCENARIO_CIVILIZATIONS.factions) {
			const card = this.factionCards.get(faction.id);
			if (!card) continue;
			const bg = card.list[0];
			const accent = import_phaser.default.Display.Color.IntegerToColor(faction.color).brighten(25).color;
			const isSelected = this.selectedFactionId === faction.id;
			bg.setFillStyle(isSelected ? 1848671 : 1056826, isSelected ? 1 : .95);
			bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? accent : 3690606, 1);
			card.setScale(isSelected ? 1.02 : 1);
		}
		const buttonBg = this.startButton?.list[0];
		const buttonLabel = this.startButton?.list[1];
		const selectedFaction = SCENARIO_CIVILIZATIONS.factions.find((f) => f.id === this.selectedFactionId);
		if (buttonBg && buttonLabel && selectedFaction) {
			buttonBg.setFillStyle(selectedFaction.color, .92);
			buttonLabel.setText(`${selectedFaction.name}으로 시작`);
		}
	}
	drawStartButton(width, height) {
		const button = this.add.container(width / 2, height - 56);
		const bg = this.add.rectangle(0, 0, 260, 50, 15777856, .92).setStrokeStyle(2, 16311459, 1).setInteractive({ useHandCursor: true });
		const label = this.add.text(0, 0, "게임 시작", {
			fontSize: "18px",
			color: "#08111d",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		bg.on("pointerover", () => {
			bg.setScale(1.03);
			button.y = height - 58;
		});
		bg.on("pointerout", () => {
			bg.setScale(1);
			button.y = height - 56;
		});
		bg.on("pointerdown", () => {
			this.scene.start("MapScene", { selectedFactionId: this.selectedFactionId });
		});
		button.add([bg, label]);
		this.startButton = button;
		this.refreshFactionCards();
	}
};
//#endregion
//#region src/data/quizzes.ts
var QUIZZES = [
	{
		id: "q01",
		question: "함무라비 법전은 현존하는 가장 오래된 성문법 중 하나이다.",
		type: "ox",
		answer: "O",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 메소포타미아 문명"
	},
	{
		id: "q02",
		question: "이집트 문명은 황허강 유역에서 발생하였다.",
		type: "ox",
		answer: "X",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 이집트 문명"
	},
	{
		id: "q03",
		question: "인더스 문명의 모헨조다로에는 바둑판 모양의 도로와 상하수도 시설이 있었다.",
		type: "ox",
		answer: "O",
		reward: { technology: 5 },
		textbookRef: "Ⅰ-1. 인더스 문명"
	},
	{
		id: "q04",
		question: "갑골 문자는 이집트 문명에서 사용된 문자이다.",
		type: "ox",
		answer: "X",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 황허 문명"
	},
	{
		id: "q05",
		question: "페니키아 알파벳은 오늘날 로마자(라틴 문자)의 기원이 되었다.",
		type: "ox",
		answer: "O",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 지중해 문명"
	},
	{
		id: "q06",
		question: "청동기의 사용은 평등한 사회를 만드는 데 기여하였다.",
		type: "ox",
		answer: "X",
		reward: { food: 5 },
		textbookRef: "Ⅰ-1. 문명의 발생"
	},
	{
		id: "q07",
		question: "이집트인들은 나일강 범람 시기를 예측하기 위해 천문학을 발달시켰다.",
		type: "ox",
		answer: "O",
		reward: { technology: 5 },
		textbookRef: "Ⅰ-1. 이집트 문명"
	},
	{
		id: "q08",
		question: "주(周)나라는 봉건제를 실시하여 왕족과 공신에게 토지를 나누어 다스리게 하였다.",
		type: "ox",
		answer: "O",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 황허 문명"
	},
	{
		id: "q09",
		question: "지구라트는 이집트 문명의 대표적인 건축물이다.",
		type: "ox",
		answer: "X",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 메소포타미아 문명"
	},
	{
		id: "q10",
		question: "철기의 보급은 대제국이 등장하는 배경이 되었다.",
		type: "ox",
		answer: "O",
		reward: { military: 5 },
		textbookRef: "Ⅰ-1. 고대 세계의 변화"
	},
	{
		id: "q11",
		question: "피라미드는 어느 문명의 대표적인 건축물인가?",
		type: "multiple",
		options: [
			"메소포타미아",
			"이집트",
			"인더스",
			"황허"
		],
		answer: "이집트",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 이집트 문명"
	},
	{
		id: "q12",
		question: "쐐기 문자를 사용한 문명은?",
		type: "multiple",
		options: [
			"이집트",
			"인더스",
			"메소포타미아",
			"황허"
		],
		answer: "메소포타미아",
		reward: { technology: 5 },
		textbookRef: "Ⅰ-1. 메소포타미아 문명"
	},
	{
		id: "q13",
		question: "카스트 제도에서 사제 계급에 해당하는 것은?",
		type: "multiple",
		options: [
			"크샤트리아",
			"바이샤",
			"브라만",
			"수드라"
		],
		answer: "브라만",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 인도의 고대 문명"
	},
	{
		id: "q14",
		question: "상(은)나라에서 점을 칠 때 사용한 것은?",
		type: "multiple",
		options: [
			"파피루스",
			"점토판",
			"갑골(거북 등껍질과 소의 뼈)",
			"대나무"
		],
		answer: "갑골(거북 등껍질과 소의 뼈)",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 황허 문명"
	},
	{
		id: "q15",
		question: "큰 강 유역에서 문명이 발생한 가장 중요한 이유는?",
		type: "multiple",
		options: [
			"군사적 방어가 쉬워서",
			"관개 농업으로 잉여 생산물이 생겨서",
			"교통이 편리해서",
			"기후가 서늘해서"
		],
		answer: "관개 농업으로 잉여 생산물이 생겨서",
		reward: { food: 5 },
		textbookRef: "Ⅰ-1. 문명의 발생"
	},
	{
		id: "q16",
		question: "이집트에서 파라오의 시신을 보존하기 위해 만든 것은?",
		type: "multiple",
		options: [
			"지구라트",
			"미라",
			"갑골",
			"점토판"
		],
		answer: "미라",
		reward: { culture: 5 },
		textbookRef: "Ⅰ-1. 이집트 문명"
	},
	{
		id: "q17",
		question: "인더스 문명의 대표적인 도시가 아닌 것은?",
		type: "multiple",
		options: [
			"하라파",
			"모헨조다로",
			"바빌론",
			"로탈"
		],
		answer: "바빌론",
		reward: { technology: 5 },
		textbookRef: "Ⅰ-1. 인더스 문명"
	},
	{
		id: "q18",
		question: "알파벳을 만들어 지중해 교역에 활용한 민족은?",
		type: "multiple",
		options: [
			"히타이트",
			"아시리아",
			"페니키아",
			"히브리"
		],
		answer: "페니키아",
		reward: { gold: 5 },
		textbookRef: "Ⅰ-1. 지중해 문명"
	},
	{
		id: "q19",
		question: "히타이트가 한때 독점했던 기술은?",
		type: "multiple",
		options: [
			"종이 제조",
			"철기 제조",
			"화약 제조",
			"유리 제조"
		],
		answer: "철기 제조",
		reward: { military: 5 },
		textbookRef: "Ⅰ-1. 고대 세계의 변화"
	},
	{
		id: "q20",
		question: "이집트인들이 나일강 범람 예측을 위해 만든 달력은?",
		type: "multiple",
		options: [
			"음력",
			"태양력",
			"태음태양력",
			"율리우스력"
		],
		answer: "태양력",
		reward: { technology: 5 },
		textbookRef: "Ⅰ-1. 이집트 문명"
	}
];
//#endregion
//#region src/game/combat.ts
/**
* 공격 세력의 최고 무력 리더를 반환
*/
function getBestMilitaryLeader(faction) {
	return faction.leaders.reduce((best, l) => !best || l.stats.military > best.stats.military ? l : best, void 0);
}
/**
* ±20% 랜덤 배율 생성 (0.8 ~ 1.2)
*/
function randomModifier() {
	return .8 + Math.random() * .4;
}
/**
* 전투 계산
* - 공격력 = 공격 병력 × (리더 무력 / 50) × 랜덤(±20%)
* - 방어력 = 방어 병력 × (영토 방어도 / 50) × 랜덤(±20%)
* - 승리 시 영토 점령, 패배 시 공격 병력 손실
*/
function calculateBattle(attacker, defender, territory, gameState) {
	const attackLeader = getBestMilitaryLeader(attacker);
	const militaryStat = attackLeader ? attackLeader.stats.military : 50;
	const attackerTerritories = gameState.territories.filter((t) => t.owner === attacker.id);
	const totalGarrison = attackerTerritories.reduce((sum, t) => sum + t.garrison, 0);
	const attackTroops = Math.floor(totalGarrison * .5);
	const defenseTroops = territory.garrison;
	const defenseRating = territory.development.defense;
	const attackerWins = attackTroops * (militaryStat / 50) * randomModifier() > defenseTroops * (defenseRating / 50) * randomModifier();
	const loserLossRate = .5 + Math.random() * .2;
	const winnerLossRate = .2 + Math.random() * .2;
	let attackerLosses;
	let defenderLosses;
	if (attackerWins) {
		attackerLosses = Math.floor(attackTroops * winnerLossRate);
		defenderLosses = Math.floor(defenseTroops * loserLossRate);
	} else {
		attackerLosses = Math.floor(attackTroops * loserLossRate);
		defenderLosses = Math.floor(defenseTroops * winnerLossRate);
	}
	if (attackerWins) {
		territory.owner = attacker.id;
		territory.garrison = Math.max(100, attackTroops - attackerLosses);
		attacker.territories.push(territory.id);
		defender.territories = defender.territories.filter((id) => id !== territory.id);
	} else territory.garrison = Math.max(100, defenseTroops - defenderLosses);
	distributeLosses(attackerTerritories, attackerLosses);
	const leaderName = attackLeader ? attackLeader.name : "무명 장수";
	const log = attackerWins ? `⚔️ ${attacker.name}의 ${leaderName}이(가) ${territory.name}을(를) 점령! (아군 -${attackerLosses}, 적군 -${defenderLosses})` : `🛡️ ${defender.name}이(가) ${territory.name} 방어 성공! (공격측 -${attackerLosses}, 방어측 -${defenderLosses})`;
	return {
		victor: attackerWins ? "attacker" : "defender",
		attackerLosses,
		defenderLosses,
		territoryConquered: attackerWins,
		log
	};
}
/**
* 손실 병력을 보유 영토에 분산 적용
*/
function distributeLosses(territories, totalLoss) {
	let remaining = totalLoss;
	for (const t of territories) {
		if (remaining <= 0) break;
		const loss = Math.min(t.garrison - 100, remaining);
		if (loss > 0) {
			t.garrison -= loss;
			remaining -= loss;
		}
	}
}
/**
* 공격 가능한 인접 적 영토 목록 반환
*/
function getAttackableTargets(faction, gameState) {
	const ownTerritoryIds = new Set(faction.territories);
	const adjacentEnemies = [];
	const seen = /* @__PURE__ */ new Set();
	for (const tid of ownTerritoryIds) {
		const t = gameState.territories.find((tt) => tt.id === tid);
		if (!t) continue;
		for (const adjId of t.adjacentTo) {
			if (ownTerritoryIds.has(adjId) || seen.has(adjId)) continue;
			seen.add(adjId);
			const adj = gameState.territories.find((tt) => tt.id === adjId);
			if (adj && adj.owner !== null && adj.owner !== faction.id) adjacentEnemies.push(adj);
		}
	}
	return adjacentEnemies;
}
//#endregion
//#region src/game/ai.ts
/** 세력별 AI 성향 매핑 */
var AI_PERSONALITIES = {
	mesopotamia: "balanced",
	egypt: "defensive",
	indus: "defensive",
	yellow_river: "aggressive"
};
/** AI 성향별 공격 병력 임계치 (총 병력 대비 적 병력 비율) */
var ATTACK_THRESHOLD = {
	aggressive: .8,
	balanced: 1.2,
	defensive: 1.8
};
/**
* AI 세력의 턴 자동 진행
* 우선순위:
*   1. 자원(식량) 부족 → 내정(농업 개발)
*   2. 병력 충분 → 인접 약한 영토 공격
*   3. 그 외 → 개발(상업/방어)
*/
function executeAITurn(faction, gameState) {
	const actions = [];
	const personality = AI_PERSONALITIES[faction.id] ?? "balanced";
	const ownTerritories = gameState.territories.filter((t) => t.owner === faction.id);
	if (ownTerritories.length === 0) return actions;
	if (faction.resources.food < 30) {
		const action = developTerritory(ownTerritories, "agriculture");
		if (action) actions.push(action);
		return actions;
	}
	const totalGarrison = ownTerritories.reduce((sum, t) => sum + t.garrison, 0);
	const targets = getAttackableTargets(faction, gameState);
	if (targets.length > 0) {
		const weakest = targets.reduce((a, b) => a.garrison < b.garrison ? a : b);
		const threshold = ATTACK_THRESHOLD[personality];
		if (totalGarrison > weakest.garrison * threshold) {
			const defender = gameState.factions.find((f) => f.id === weakest.owner);
			if (defender) {
				const result = calculateBattle(faction, defender, weakest, gameState);
				actions.push({
					type: "attack",
					description: result.log,
					targetTerritory: weakest.id
				});
				return actions;
			}
		}
	}
	const devAction = developBestTerritory(ownTerritories, personality);
	if (devAction) actions.push(devAction);
	const recruitAction = recruitTroops(ownTerritories, faction);
	if (recruitAction) actions.push(recruitAction);
	return actions;
}
/**
* 특정 분야의 개발이 가장 낮은 영토를 개발
*/
function developTerritory(territories, field) {
	if (territories.length === 0) return null;
	const target = territories.reduce((a, b) => a.development[field] < b.development[field] ? a : b);
	const increase = 5 + Math.floor(Math.random() * 6);
	target.development[field] = Math.min(100, target.development[field] + increase);
	return {
		type: "develop",
		description: `${target.name}의 ${{
			agriculture: "농업",
			commerce: "상업",
			defense: "방어"
		}[field]}을(를) ${increase}만큼 개발했습니다. (→${target.development[field]})`,
		targetTerritory: target.id,
		value: increase
	};
}
/**
* AI 성향에 따라 최적 개발 분야 결정
*/
function developBestTerritory(territories, personality) {
	switch (personality) {
		case "aggressive": return developTerritory(territories, "commerce");
		case "defensive": return developTerritory(territories, "defense");
		default: {
			const avgAg = avg(territories.map((t) => t.development.agriculture));
			const avgCo = avg(territories.map((t) => t.development.commerce));
			const avgDe = avg(territories.map((t) => t.development.defense));
			const min = Math.min(avgAg, avgCo, avgDe);
			if (min === avgAg) return developTerritory(territories, "agriculture");
			if (min === avgCo) return developTerritory(territories, "commerce");
			return developTerritory(territories, "defense");
		}
	}
}
/**
* 병력 충원: 식량을 소비하여 병력 추가
*/
function recruitTroops(territories, faction) {
	if (faction.resources.food < 10) return null;
	const target = territories.reduce((a, b) => a.garrison < b.garrison ? a : b);
	const recruits = 200 + Math.floor(Math.random() * 300);
	target.garrison += recruits;
	faction.resources.food -= 5;
	return {
		type: "recruit",
		description: `${target.name}에 ${recruits}명을 충원했습니다. (총 ${target.garrison}명)`,
		targetTerritory: target.id,
		value: recruits
	};
}
/** 배열 평균 */
function avg(nums) {
	if (nums.length === 0) return 0;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}
//#endregion
//#region src/game/diplomacy.ts
/**
* 외교 관계 저장소
* 키: "factionA::factionB" (알파벳 순 정렬)
*/
var relations = /* @__PURE__ */ new Map();
/** 관계 키 생성 (항상 알파벳 순으로 정렬) */
function makeKey(a, b) {
	return a < b ? `${a}::${b}` : `${b}::${a}`;
}
/**
* 두 세력 간 관계 수치 조회 (-100 ~ 100)
* 관계가 없으면 0(중립)으로 초기화
*/
function getRelation(factionA, factionB) {
	if (factionA === factionB) return 100;
	const key = makeKey(factionA, factionB);
	const rel = relations.get(key);
	return rel ? rel.value : 0;
}
/**
* 두 세력 간 관계 수치 설정
*/
function setRelation(factionA, factionB, value) {
	if (factionA === factionB) return;
	const key = makeKey(factionA, factionB);
	const clamped = Math.max(-100, Math.min(100, value));
	relations.set(key, {
		factionA: factionA < factionB ? factionA : factionB,
		factionB: factionA < factionB ? factionB : factionA,
		value: clamped
	});
}
/**
* 관계 수치 변동 (현재 값에 delta 추가)
*/
function changeRelation(factionA, factionB, delta) {
	const current = getRelation(factionA, factionB);
	const newValue = Math.max(-100, Math.min(100, current + delta));
	setRelation(factionA, factionB, newValue);
	return newValue;
}
/**
* 턴 종료 시 모든 관계 자연 감소 (-2)
*/
function decayAllRelations() {
	for (const [key, rel] of relations) {
		if (rel.value > 0) rel.value = Math.max(0, rel.value - 2);
		else if (rel.value < 0) rel.value = Math.min(0, rel.value + 2);
		relations.set(key, rel);
	}
}
/**
* 교역 제안
* - 관계가 적대(-30 이하)면 자동 거절
* - 제안의 가치 균형과 관계 수치로 수락 여부 결정
*/
function proposeTrade(proposal, factions) {
	const relation = getRelation(proposal.from, proposal.to);
	const receiver = factions.find((f) => f.id === proposal.to);
	if (!receiver) return {
		accepted: false,
		reason: "대상 세력을 찾을 수 없습니다."
	};
	if (relation <= -30) return {
		accepted: false,
		reason: "적대 관계로 교역이 거부되었습니다."
	};
	const offerValue = sumResources(proposal.offer);
	const demandValue = sumResources(proposal.demand);
	if (!hasEnoughResources(receiver.resources, proposal.demand)) return {
		accepted: false,
		reason: "대상 세력의 자원이 부족합니다."
	};
	const relationBonus = relation * .3;
	if (demandValue - offerValue - relationBonus > 20) return {
		accepted: false,
		reason: "제안 조건이 불리하여 거절되었습니다."
	};
	const sender = factions.find((f) => f.id === proposal.from);
	if (!sender) return {
		accepted: false,
		reason: "제안 세력을 찾을 수 없습니다."
	};
	applyResourceTransfer(sender.resources, proposal.offer, proposal.demand);
	applyResourceTransfer(receiver.resources, proposal.demand, proposal.offer);
	changeRelation(proposal.from, proposal.to, 5);
	return {
		accepted: true,
		reason: "교역이 성사되었습니다!"
	};
}
/**
* 동맹 제안
* - 관계 50 이상이면 수락
* - 관계 20~50이면 외교력 스탯에 따라 확률적 수락
* - 관계 20 미만이면 거절
*/
function proposeAlliance(fromFaction, toFaction) {
	const relation = getRelation(fromFaction.id, toFaction.id);
	if (relation >= 80) return {
		accepted: true,
		newRelationValue: relation,
		reason: "이미 우호적 관계입니다."
	};
	if (relation < 20) return {
		accepted: false,
		newRelationValue: relation,
		reason: "관계가 너무 나빠 동맹을 거절했습니다."
	};
	const diplomat = fromFaction.leaders.reduce((best, l) => Math.max(best, l.stats.diplomacy), 0);
	const acceptChance = (relation - 20) / 30 + diplomat / 200;
	if (Math.random() < acceptChance) return {
		accepted: true,
		newRelationValue: changeRelation(fromFaction.id, toFaction.id, 30),
		reason: `${toFaction.name}이(가) 동맹을 수락했습니다!`
	};
	return {
		accepted: false,
		newRelationValue: relation,
		reason: `${toFaction.name}이(가) 동맹 제안을 거절했습니다.`
	};
}
function sumResources(res) {
	return (res.food ?? 0) + (res.gold ?? 0) + (res.culture ?? 0) + (res.military ?? 0) + (res.technology ?? 0);
}
function hasEnoughResources(current, required) {
	for (const key of Object.keys(required)) if ((required[key] ?? 0) > current[key]) return false;
	return true;
}
function applyResourceTransfer(resources, give, receive) {
	for (const key of Object.keys(give)) resources[key] -= give[key] ?? 0;
	for (const key of Object.keys(receive)) resources[key] += receive[key] ?? 0;
}
//#endregion
//#region src/scenes/MapScene.ts
var MapScene = class extends import_phaser.default.Scene {
	gameState = null;
	territorySprites = /* @__PURE__ */ new Map();
	infoText;
	selectedFactionId = SCENARIO_CIVILIZATIONS.factions[0].id;
	selectedTerritoryId = null;
	shownQuizIds = /* @__PURE__ */ new Set();
	constructor() {
		super({ key: "MapScene" });
	}
	init(data) {
		this.selectedFactionId = data.selectedFactionId ?? SCENARIO_CIVILIZATIONS.factions[0].id;
	}
	create() {
		const scenario = SCENARIO_CIVILIZATIONS;
		const factions = scenario.factions.map((f) => ({
			...f,
			isPlayer: f.id === this.selectedFactionId
		}));
		const playerFaction = factions.find((f) => f.isPlayer) ?? factions[0];
		this.gameState = {
			turn: 1,
			year: scenario.startYear,
			phase: "development",
			currentFaction: playerFaction.id,
			factions,
			territories: [...scenario.territories],
			events: [...scenario.events],
			log: [`턴 1: ${playerFaction.name}이(가) ${scenario.title} 시나리오에 참전했습니다.`]
		};
		this.cameras.main.setBackgroundColor("#0d1b2a");
		this.drawBackdrop();
		this.drawConnections();
		this.drawTerritoryInfluence();
		this.drawTerritories();
		this.add.text(640, 25, `🏛️ ${scenario.title}`, {
			fontSize: "28px",
			color: "#f0c040",
			fontFamily: "Georgia, serif"
		}).setOrigin(.5);
		this.infoText = this.add.text(20, 648, "", {
			fontSize: "14px",
			color: "#d8e0ec",
			fontFamily: "monospace",
			backgroundColor: "#101c31",
			padding: {
				x: 12,
				y: 7
			}
		});
		this.updateTurnInfo();
		this.scene.stop("UIScene");
		this.scene.launch("UIScene", {
			gameState: this.gameState,
			mapScene: this
		});
		this.setupKeyboardControls();
	}
	drawBackdrop() {
		const graphics = this.add.graphics();
		graphics.fillGradientStyle(726563, 1056820, 1319741, 594462, 1, 1, 1, 1);
		graphics.fillRect(0, 0, 1280, 720);
		graphics.fillStyle(1519949, .22);
		graphics.fillEllipse(640, 360, 980, 520);
		graphics.lineStyle(2, 2441824, .28);
		graphics.strokeEllipse(640, 360, 1020, 560);
	}
	drawConnections() {
		const territories = this.gameState.territories;
		const drawn = /* @__PURE__ */ new Set();
		const graphics = this.add.graphics();
		for (const t of territories) for (const adjId of t.adjacentTo) {
			const key = [t.id, adjId].sort().join("-");
			if (drawn.has(key)) continue;
			drawn.add(key);
			const adj = territories.find((tt) => tt.id === adjId);
			if (!adj) continue;
			this.drawDashedLine(graphics, t.x, t.y, adj.x, adj.y, 6, 4, 4678011, .52);
		}
	}
	/** 점선을 그리는 헬퍼 */
	drawDashedLine(graphics, x1, y1, x2, y2, dashSize, gapSize, color, alpha) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const stepSize = dashSize + gapSize;
		const steps = Math.floor(dist / stepSize);
		const ux = dx / dist;
		const uy = dy / dist;
		graphics.lineStyle(2, color, alpha);
		for (let i = 0; i < steps; i++) {
			const sx = x1 + ux * i * stepSize;
			const sy = y1 + uy * i * stepSize;
			const ex = sx + ux * dashSize;
			const ey = sy + uy * dashSize;
			graphics.beginPath();
			graphics.moveTo(sx, sy);
			graphics.lineTo(ex, ey);
			graphics.strokePath();
		}
	}
	drawTerritoryInfluence() {
		const graphics = this.add.graphics();
		const factionGroups = /* @__PURE__ */ new Map();
		for (const territory of this.gameState.territories) {
			if (!territory.owner) continue;
			const list = factionGroups.get(territory.owner) ?? [];
			list.push(territory);
			factionGroups.set(territory.owner, list);
		}
		for (const faction of this.gameState.factions) {
			const territories = factionGroups.get(faction.id);
			if (!territories || territories.length === 0) continue;
			const xs = territories.map((t) => t.x);
			const ys = territories.map((t) => t.y);
			const centerX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
			const centerY = ys.reduce((sum, y) => sum + y, 0) / ys.length;
			const width = Math.max(...xs) - Math.min(...xs) + 160;
			const height = Math.max(...ys) - Math.min(...ys) + 140;
			const accent = import_phaser.default.Display.Color.IntegerToColor(faction.color).brighten(35).color;
			graphics.fillStyle(accent, .22);
			graphics.fillEllipse(centerX, centerY, width, height);
			graphics.lineStyle(1, accent, .35);
			graphics.strokeEllipse(centerX, centerY, width, height);
		}
	}
	drawTerritories() {
		for (const territory of this.gameState.territories) {
			const faction = this.gameState.factions.find((f) => f.id === territory.owner);
			const color = faction ? import_phaser.default.Display.Color.IntegerToColor(faction.color).brighten(30).color : 8029588;
			const points = [
				-32,
				-7,
				-18,
				-25,
				18,
				-25,
				32,
				-7,
				32,
				14,
				0,
				30,
				-32,
				14
			];
			const container = this.add.container(territory.x, territory.y);
			const glow = this.add.polygon(0, 0, points, color, .18).setStrokeStyle(3, 16245408, 0).setScale(1.3).setVisible(false);
			const base = this.add.polygon(0, 0, points, color, .9).setStrokeStyle(2, 16051672, .65);
			const banner = this.add.rectangle(0, -6, 30, 12, 15777856, .95).setStrokeStyle(1, 3418378, .55);
			const keep = this.add.rectangle(0, 2, 16, 21, 2110024, .92).setStrokeStyle(1, 16777215, .25);
			const gate = this.add.rectangle(0, 9, 7, 12, 528669, .95);
			let civIcon = null;
			if (faction) {
				const iconKey = FACTION_ICON_MAP[faction.id];
				if (iconKey && this.textures.exists(iconKey)) {
					base.setAlpha(.3);
					banner.setAlpha(.3);
					keep.setAlpha(.3);
					gate.setAlpha(.3);
					civIcon = this.add.image(0, 0, iconKey).setDisplaySize(48, 48);
				}
			}
			const nameText = this.add.text(0, -50, territory.name, {
				fontSize: "13px",
				color: "#f7f3e7",
				fontFamily: "sans-serif",
				stroke: "#08111d",
				strokeThickness: 3
			}).setOrigin(.5);
			const garrisonText = this.add.text(0, 34, `⚔️ ${(territory.garrison / 1e3).toFixed(1)}k`, {
				fontSize: "11px",
				color: "#ffccaf",
				fontFamily: "monospace",
				stroke: "#08111d",
				strokeThickness: 2
			}).setOrigin(.5);
			const children = [
				glow,
				base,
				banner,
				keep,
				gate
			];
			if (civIcon) children.push(civIcon);
			children.push(nameText, garrisonText);
			container.add(children);
			container.setSize(84, 84);
			container.setInteractive(new import_phaser.default.Geom.Circle(0, 0, 40), import_phaser.default.Geom.Circle.Contains);
			container.on("pointerdown", () => {
				this.onTerritoryClick(territory);
			});
			container.on("pointerover", () => {
				glow.setVisible(true);
				glow.setStrokeStyle(3, 16245408, .85);
				this.tweens.add({
					targets: glow,
					scale: 1.45,
					alpha: .35,
					duration: 220,
					ease: "Sine.Out"
				});
				base.setScale(1.08);
				banner.setScale(1.08);
				this.showTerritoryInfo(territory, faction);
			});
			container.on("pointerout", () => {
				this.tweens.killTweensOf(glow);
				if (this.selectedTerritoryId === territory.id) this.applySelectedVisual(territory.id);
				else {
					glow.setVisible(false);
					glow.setScale(1.3);
					glow.setAlpha(.18);
					glow.setStrokeStyle(3, 16245408, 0);
				}
				base.setScale(1);
				banner.setScale(1);
				this.infoText.setText("");
			});
			this.territorySprites.set(territory.id, {
				container,
				base,
				glow,
				banner
			});
		}
	}
	showTerritoryInfo(territory, faction) {
		const owner = faction ? faction.name : "무소속";
		this.infoText.setText(`${territory.name} | 소유: ${owner} | 인구: ${territory.population.toLocaleString()} | 농업: ${territory.development.agriculture} | 상업: ${territory.development.commerce} | 방어: ${territory.development.defense} | 병력: ${territory.garrison.toLocaleString()}`);
	}
	onTerritoryClick(territory) {
		this.selectTerritory(territory);
		this.events.emit("territory-selected", territory);
	}
	setupKeyboardControls() {
		this.input.keyboard?.on("keydown", this.handleKeyboardInput, this);
		this.events.once(import_phaser.default.Scenes.Events.SHUTDOWN, () => {
			this.input.keyboard?.off("keydown", this.handleKeyboardInput, this);
		});
	}
	handleKeyboardInput(event) {
		const direction = {
			ArrowUp: "up",
			ArrowDown: "down",
			ArrowLeft: "left",
			ArrowRight: "right"
		}[event.code];
		if (direction) {
			this.moveSelection(direction);
			return;
		}
		const digit = this.getMenuDigitFromKeyEvent(event);
		if (digit !== null) this.scene.get("UIScene").events.emit("menu-command", digit);
	}
	getMenuDigitFromKeyEvent(event) {
		if (/^Digit[0-9]$/.test(event.code) || /^Numpad[0-9]$/.test(event.code)) return Number(event.code.slice(-1));
		if (/^[0-9]$/.test(event.key)) return Number(event.key);
		return null;
	}
	moveSelection(direction) {
		if (!this.gameState || !this.selectedTerritoryId) return;
		const current = this.gameState.territories.find((territory) => territory.id === this.selectedTerritoryId);
		if (!current) return;
		const nextTerritory = this.findAdjacentTerritoryByDirection(current, direction);
		if (!nextTerritory) return;
		this.selectTerritory(nextTerritory);
		this.events.emit("territory-selected", nextTerritory);
	}
	findAdjacentTerritoryByDirection(current, direction) {
		if (!this.gameState) return null;
		const adjacentTerritories = current.adjacentTo.map((adjacentId) => this.gameState.territories.find((territory) => territory.id === adjacentId)).filter((territory) => territory !== void 0);
		if (adjacentTerritories.length === 0) return null;
		return adjacentTerritories.map((territory) => {
			const dx = territory.x - current.x;
			const dy = territory.y - current.y;
			return {
				territory,
				dx,
				dy,
				axisDistance: direction === "left" || direction === "right" ? Math.abs(dx) : Math.abs(dy),
				crossDistance: direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx)
			};
		}).filter(({ dx, dy }) => {
			if (direction === "up") return dy < 0;
			if (direction === "down") return dy > 0;
			if (direction === "left") return dx < 0;
			return dx > 0;
		}).sort((a, b) => {
			if (a.crossDistance !== b.crossDistance) return a.crossDistance - b.crossDistance;
			return a.axisDistance - b.axisDistance;
		})[0]?.territory ?? null;
	}
	selectTerritory(territory) {
		if (this.selectedTerritoryId === territory.id) {
			this.applySelectedVisual(territory.id);
			return;
		}
		const previousId = this.selectedTerritoryId;
		this.selectedTerritoryId = territory.id;
		if (previousId) this.clearSelectedVisual(previousId);
		this.applySelectedVisual(territory.id);
	}
	applySelectedVisual(territoryId) {
		const visual = this.territorySprites.get(territoryId);
		if (!visual) return;
		this.tweens.killTweensOf(visual.glow);
		visual.glow.setVisible(true);
		visual.glow.setScale(1.38);
		visual.glow.setAlpha(.4);
		visual.glow.setStrokeStyle(4, 16773811, .95);
		this.tweens.add({
			targets: visual.glow,
			scale: 1.52,
			alpha: .65,
			duration: 520,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut"
		});
	}
	clearSelectedVisual(territoryId) {
		const visual = this.territorySprites.get(territoryId);
		if (!visual) return;
		this.tweens.killTweensOf(visual.glow);
		visual.glow.setVisible(false);
		visual.glow.setScale(1.3);
		visual.glow.setAlpha(.18);
		visual.glow.setStrokeStyle(3, 16245408, 0);
	}
	calculateYear(turn) {
		return SCENARIO_CIVILIZATIONS.startYear + Math.floor(turn / 12);
	}
	/** 턴 정보 갱신 (UIScene이 'log-updated' 이벤트로 갱신하므로 빈 구현) */
	updateTurnInfo() {}
	nextTurn() {
		const nextIdx = (this.gameState.factions.findIndex((f) => f.id === this.gameState.currentFaction) + 1) % this.gameState.factions.length;
		if (nextIdx === 0) {
			this.gameState.turn++;
			const previousYear = this.gameState.year;
			this.gameState.year = this.calculateYear(this.gameState.turn);
			for (const faction of this.gameState.factions) {
				const ownedTerritories = this.gameState.territories.filter((t) => t.owner === faction.id);
				for (const t of ownedTerritories) {
					faction.resources.food += Math.floor(t.development.agriculture / 10);
					faction.resources.gold += Math.floor(t.development.commerce / 10);
				}
				faction.resources.culture += 2;
				faction.resources.technology += 1;
			}
			decayAllRelations();
			if (this.gameState.year !== previousYear) this.addLog(`턴 ${this.gameState.turn}: 새로운 해가 시작되었습니다.`);
			this.checkEvents();
			if (this.gameState.turn % 3 === 0) {
				const quiz = this.getNextQuiz();
				this.events.emit("quiz-trigger", quiz);
			}
		}
		this.gameState.currentFaction = this.gameState.factions[nextIdx].id;
		this.updateTurnInfo();
		const nextFaction = this.gameState.factions[nextIdx];
		if (!nextFaction.isPlayer) this.time.delayedCall(500, () => {
			this.doAITurn(nextFaction);
			this.nextTurn();
		});
	}
	doAITurn(faction) {
		const actions = executeAITurn(faction, this.gameState);
		if (actions.length === 0) {
			this.addLog(`턴 ${this.gameState.turn}: ${faction.name}이(가) 세력을 재정비했습니다.`);
			return;
		}
		for (const action of actions) this.addLog(`턴 ${this.gameState.turn}: ${faction.name} — ${action.description}`);
		if (actions.some((a) => a.type === "attack")) this.refreshTerritoryVisuals();
	}
	checkEvents() {
		for (const event of this.gameState.events) if (!event.triggered && event.triggerTurn <= this.gameState.turn) {
			event.triggered = true;
			this.events.emit("game-event", event);
		}
	}
	addLog(message) {
		this.gameState.log.push(message);
		this.events.emit("log-updated", this.gameState.log);
	}
	/** 아직 출제되지 않은 퀴즈를 무작위로 1개 선택한다. */
	getNextQuiz() {
		let availableQuizzes = QUIZZES.filter((quiz) => !this.shownQuizIds.has(quiz.id));
		if (availableQuizzes.length === 0) {
			this.shownQuizIds.clear();
			availableQuizzes = [...QUIZZES];
		}
		const quiz = import_phaser.default.Utils.Array.GetRandom(availableQuizzes);
		this.shownQuizIds.add(quiz.id);
		return quiz;
	}
	/** 영토 색상·병력 텍스트를 현재 상태에 맞게 갱신 */
	refreshTerritoryVisuals() {
		for (const territory of this.gameState.territories) {
			const visual = this.territorySprites.get(territory.id);
			if (!visual) continue;
			const faction = this.gameState.factions.find((f) => f.id === territory.owner);
			const color = faction ? import_phaser.default.Display.Color.IntegerToColor(faction.color).brighten(30).color : 8029588;
			visual.base.setFillStyle(color, .9);
			visual.glow.setFillStyle(color, .18);
			const children = visual.container.list;
			const garrisonText = children[children.length - 1];
			if (garrisonText?.setText) garrisonText.setText(`⚔️ ${(territory.garrison / 1e3).toFixed(1)}k`);
		}
	}
	getGameState() {
		return this.gameState;
	}
};
//#endregion
//#region src/scenes/UIScene.ts
var COLORS = {
	darkest: 661032,
	panel: 1450302,
	button: 2771583,
	buttonHover: 3828415,
	gold: 15777856,
	lightText: 16051672,
	barBg: 1714751,
	agriculture: 5025616,
	commerce: 16761095,
	defense: 2201331,
	military: 16007990
};
var UIScene = class extends import_phaser.default.Scene {
	gameState;
	mapScene;
	panel;
	eventPanel;
	quizPanel;
	battleModal;
	diplomacyPanel;
	tutorialPanel;
	logPanel;
	logTexts = [];
	quizCloseTimer;
	menuButtons = [];
	activeMenuIndex = -1;
	turnInfoText;
	constructor() {
		super({ key: "UIScene" });
	}
	init(data) {
		this.gameState = data.gameState;
		this.mapScene = data.mapScene;
	}
	create() {
		this.createMenuBar();
		this.updateResourcePanel();
		this.panel = this.add.container(1050, 50);
		const panelBg = this.add.rectangle(0, 0, 220, 590, COLORS.panel, .92).setStrokeStyle(1, 3359846).setOrigin(0);
		this.panel.add(panelBg);
		this.panel.setVisible(false);
		this.eventPanel = this.add.container(640, 360).setVisible(false);
		this.quizPanel = this.add.container(640, 360).setVisible(false);
		this.battleModal = this.add.container(640, 360).setVisible(false);
		this.diplomacyPanel = this.add.container(640, 360).setVisible(false);
		this.tutorialPanel = this.add.container(640, 360).setVisible(false);
		this.createLogPanel();
		this.createButton(760, 668, "⏭️ 턴 종료", () => {
			this.mapScene.nextTurn();
			this.updateResourcePanel();
			this.updateLeaderPanel();
		});
		this.createButton(620, 668, "🤝 외교", () => {
			this.showDiplomacyPanel();
		});
		this.createLeaderPanel();
		const mapScene = this.scene.get("MapScene");
		mapScene.events.on("territory-selected", (territory) => {
			this.showTerritoryPanel(territory);
		});
		mapScene.events.on("game-event", (event) => {
			this.showEventModal(event);
		});
		mapScene.events.on("quiz-trigger", (quiz) => {
			this.showQuizModal(quiz);
		});
		mapScene.events.on("log-updated", () => {
			this.refreshLogPanel(true);
			this.updateTurnInfo();
			this.updateLeaderPanel();
		});
		mapScene.events.on("menu-command", (digit) => {
			this.handleMenuCommand(digit);
		});
		this.refreshLogPanel(false);
		if (this.gameState.turn === 1) this.showTutorialModal();
	}
	createMenuBar() {
		this.add.rectangle(640, 22, 1280, 44, COLORS.darkest, .95).setStrokeStyle(1, COLORS.gold, .4);
		const menuDefs = [
			{
				digit: 0,
				label: "휴양"
			},
			{
				digit: 1,
				label: "군사"
			},
			{
				digit: 2,
				label: "인사"
			},
			{
				digit: 3,
				label: "외교"
			},
			{
				digit: 4,
				label: "정보"
			},
			{
				digit: 5,
				label: "개발"
			},
			{
				digit: 6,
				label: "계략"
			},
			{
				digit: 7,
				label: "상인"
			},
			{
				digit: 8,
				label: "특별"
			},
			{
				digit: 9,
				label: "기능"
			}
		];
		const btnW = 92;
		const btnH = 32;
		const startX = 8;
		this.menuButtons = [];
		menuDefs.forEach((menu, index) => {
			const x = startX + index * (btnW + 4) + btnW / 2;
			const y = 22;
			const bg = this.add.rectangle(x, y, btnW, btnH, COLORS.panel, .92).setStrokeStyle(1, COLORS.gold, .5).setInteractive({ useHandCursor: true });
			const label = this.add.text(x, y, `${menu.digit}. ${menu.label}`, {
				fontSize: "12px",
				color: "#f0f4ff",
				fontFamily: "monospace"
			}).setOrigin(.5);
			bg.on("pointerover", () => {
				if (this.activeMenuIndex !== index) bg.setFillStyle(2110805);
			});
			bg.on("pointerout", () => {
				if (this.activeMenuIndex !== index) bg.setFillStyle(COLORS.panel);
			});
			bg.on("pointerdown", () => {
				this.setActiveMenu(index);
				this.handleMenuCommand(menu.digit);
			});
			this.menuButtons.push({
				bg,
				label
			});
		});
		const yearStr = this.gameState.year < 0 ? `기원전 ${Math.abs(this.gameState.year)}년` : `${this.gameState.year}년`;
		this.turnInfoText = this.add.text(1270, 22, `턴 ${this.gameState.turn} | ${yearStr}`, {
			fontSize: "13px",
			color: "#f0c040",
			fontFamily: "monospace"
		}).setOrigin(1, .5);
	}
	setActiveMenu(index) {
		if (this.activeMenuIndex >= 0 && this.activeMenuIndex < this.menuButtons.length) {
			const prev = this.menuButtons[this.activeMenuIndex];
			prev.bg.setFillStyle(COLORS.panel);
			prev.bg.setStrokeStyle(1, COLORS.gold, .5);
			prev.label.setColor("#f0f4ff");
		}
		this.activeMenuIndex = index;
		if (index >= 0 && index < this.menuButtons.length) {
			const curr = this.menuButtons[index];
			curr.bg.setFillStyle(3824175);
			curr.bg.setStrokeStyle(2, COLORS.gold, .9);
			curr.label.setColor("#f0c040");
		}
	}
	updateTurnInfo() {
		const yearStr = this.gameState.year < 0 ? `기원전 ${Math.abs(this.gameState.year)}년` : `${this.gameState.year}년`;
		this.turnInfoText.setText(`턴 ${this.gameState.turn} | ${yearStr}`);
	}
	updateResourcePanel() {
		const existing = this.children.getByName("resourceContainer");
		if (existing) existing.destroy();
		const playerFaction = this.gameState.factions.find((f) => f.isPlayer);
		if (!playerFaction) return;
		const container = this.add.container(10, 50).setName("resourceContainer");
		const r = playerFaction.resources;
		const bg = this.add.rectangle(0, 0, 290, 70, COLORS.darkest, .85).setStrokeStyle(1, 3359846, .6).setOrigin(0);
		container.add(bg);
		const nameText = this.add.text(10, 6, `👑 ${playerFaction.name}`, {
			fontSize: "13px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		});
		container.add(nameText);
		const resources = [
			{
				key: "food",
				fallback: "🌾",
				val: r.food,
				max: 200,
				color: 5025616
			},
			{
				key: "gold",
				fallback: "💰",
				val: r.gold,
				max: 200,
				color: 16761095
			},
			{
				key: "culture",
				fallback: "🎭",
				val: r.culture,
				max: 200,
				color: 10233776
			},
			{
				key: "military",
				fallback: "⚔️",
				val: r.military,
				max: 200,
				color: 16007990
			},
			{
				key: "technology",
				fallback: "🔬",
				val: r.technology,
				max: 200,
				color: 2201331
			}
		];
		const barMaxW = 40;
		resources.forEach((res, i) => {
			const x = 10 + i * 56;
			const iconKey = RESOURCE_ICON_MAP[res.key];
			if (iconKey && this.textures.exists(iconKey)) {
				const icon = this.add.image(x + 10, 30, iconKey).setDisplaySize(20, 20).setOrigin(.5);
				container.add(icon);
				const text = this.add.text(x + 22, 24, `${res.val}`, {
					fontSize: "12px",
					color: "#f4edd8",
					fontFamily: "monospace"
				});
				container.add(text);
			} else {
				const text = this.add.text(x, 26, `${res.fallback}${res.val}`, {
					fontSize: "12px",
					color: "#f4edd8",
					fontFamily: "monospace"
				});
				container.add(text);
			}
			const barW = barMaxW * Math.min(res.val / res.max, 1);
			const barBg = this.add.rectangle(x, 46, barMaxW, 4, COLORS.barBg, .8).setOrigin(0);
			const barFill = this.add.rectangle(x, 46, Math.max(barW, 1), 4, res.color, .9).setOrigin(0);
			container.add([barBg, barFill]);
		});
	}
	createLogPanel() {
		this.logPanel = this.add.container(20, 596);
		const bg = this.add.rectangle(0, 0, 580, 104, 989741, .92).setStrokeStyle(1, COLORS.gold, .45).setOrigin(0);
		const title = this.add.text(14, 6, "📜 연대기", {
			fontSize: "12px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		});
		this.logPanel.add([bg, title]);
		this.logTexts = [];
		for (let i = 0; i < 4; i++) {
			const text = this.add.text(16, 24 + i * 20, "", {
				fontSize: "11px",
				color: "#d8e0ec",
				fontFamily: "sans-serif",
				wordWrap: { width: 550 }
			});
			this.logTexts.push(text);
			this.logPanel.add(text);
		}
	}
	refreshLogPanel(animate) {
		const recentLogs = this.gameState.log.slice(-4);
		this.logTexts.forEach((text, index) => {
			const value = recentLogs[index] ?? "";
			text.setText(value);
			if (!animate || !value) {
				text.setAlpha(1);
				return;
			}
			text.setAlpha(0);
			this.tweens.add({
				targets: text,
				alpha: 1,
				duration: 260,
				delay: index * 40,
				ease: "Sine.Out"
			});
		});
	}
	createLeaderPanel() {
		const existing = this.children.getByName("leaderContainer");
		if (existing) existing.destroy();
		const container = this.add.container(860, 596).setName("leaderContainer");
		const playerFaction = this.gameState.factions.find((f) => f.isPlayer);
		if (!playerFaction) return container;
		const bg = this.add.rectangle(0, 0, 200, 104, COLORS.darkest, .92).setStrokeStyle(1, 4482696, .6).setOrigin(0);
		container.add(bg);
		const overlay = this.add.rectangle(0, 0, 200, 104, playerFaction.color, .08).setOrigin(0);
		container.add(overlay);
		const icon = this.add.text(16, 12, {
			mesopotamia: "🏛️",
			egypt: "🔺",
			indus: "🏗️",
			yellow_river: "🏯"
		}[playerFaction.id] ?? "👑", { fontSize: "32px" });
		container.add(icon);
		const nameText = this.add.text(60, 10, playerFaction.name, {
			fontSize: "16px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		});
		container.add(nameText);
		const territories = this.gameState.territories.filter((t) => t.owner === playerFaction.id);
		const totalGarrison = territories.reduce((sum, t) => sum + t.garrison, 0);
		const infoText = this.add.text(60, 34, `영토 ${territories.length}개`, {
			fontSize: "12px",
			color: "#a8b4cc",
			fontFamily: "sans-serif"
		});
		container.add(infoText);
		const troopText = this.add.text(60, 52, `병력 ${totalGarrison.toLocaleString()}명`, {
			fontSize: "12px",
			color: "#a8b4cc",
			fontFamily: "sans-serif"
		});
		container.add(troopText);
		const ruler = playerFaction.leaders.find((l) => l.role === "ruler");
		if (ruler) {
			const rulerText = this.add.text(60, 74, `군주: ${ruler.name}`, {
				fontSize: "11px",
				color: "#88aacc",
				fontFamily: "sans-serif"
			});
			container.add(rulerText);
		}
		return container;
	}
	updateLeaderPanel() {
		this.createLeaderPanel();
	}
	createButton(x, y, text, callback) {
		const btn = this.add.container(x, y);
		const bg = this.add.rectangle(0, 0, 130, 32, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
		const label = this.add.text(0, 0, text, {
			fontSize: "13px",
			color: "#ffffff",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		bg.on("pointerover", () => bg.setFillStyle(COLORS.buttonHover));
		bg.on("pointerout", () => bg.setFillStyle(COLORS.button));
		bg.on("pointerdown", callback);
		btn.add([bg, label]);
		return btn;
	}
	showTerritoryPanel(territory) {
		this.panel.setVisible(true);
		while (this.panel.list.length > 1) {
			const child = this.panel.list[this.panel.list.length - 1];
			this.panel.remove(child, true);
		}
		const faction = this.gameState.factions.find((f) => f.id === territory.owner);
		const isOwn = faction?.isPlayer ?? false;
		let y = 15;
		const addText = (text, color = "#ffffff", size = "13px") => {
			const t = this.add.text(15, y, text, {
				fontSize: size,
				color,
				fontFamily: "sans-serif",
				wordWrap: { width: 190 }
			});
			this.panel.add(t);
			y += t.height + 6;
			return t;
		};
		addText(`📍 ${territory.name}`, "#f0c040", "17px");
		addText(`소유: ${faction?.name || "무소속"}`, "#aaaaaa", "12px");
		addText(`인구: ${territory.population.toLocaleString()}명`, "#cccccc", "12px");
		const divider = this.add.rectangle(110, y, 190, 1, 3359846, .8);
		this.panel.add(divider);
		y += 10;
		const stats = [
			{
				label: "🌾 농업",
				value: territory.development.agriculture,
				max: 100,
				color: COLORS.agriculture
			},
			{
				label: "💰 상업",
				value: territory.development.commerce,
				max: 100,
				color: COLORS.commerce
			},
			{
				label: "🛡️ 방어",
				value: territory.development.defense,
				max: 100,
				color: COLORS.defense
			},
			{
				label: "⚔️ 병력",
				value: Math.min(territory.garrison / 50, 100),
				max: 100,
				color: COLORS.military
			}
		];
		for (const stat of stats) {
			const labelText = this.add.text(15, y, stat.label, {
				fontSize: "11px",
				color: "#a8b4cc",
				fontFamily: "sans-serif"
			});
			this.panel.add(labelText);
			const barX = 15;
			const barY = y + 18;
			const barW = 140;
			const barH = 12;
			const ratio = import_phaser.default.Math.Clamp(stat.value, 0, stat.max) / stat.max;
			const fillW = Math.max(barW * ratio, 1);
			const barBg = this.add.graphics();
			barBg.fillStyle(COLORS.barBg, 1);
			barBg.fillRoundedRect(barX, barY, barW, barH, 3);
			this.panel.add(barBg);
			if (fillW > 2) {
				const barFill = this.add.graphics();
				barFill.fillStyle(stat.color, 1);
				barFill.fillRoundedRect(barX, barY, fillW, barH, 3);
				this.panel.add(barFill);
			}
			const numVal = stat.label.includes("병력") ? territory.garrison.toLocaleString() : `${Math.round(stat.value)}`;
			const numText = this.add.text(barX + barW + 6, barY - 1, numVal, {
				fontSize: "11px",
				color: "#f4edd8",
				fontFamily: "monospace"
			});
			this.panel.add(numText);
			y += 36;
		}
		if (isOwn) {
			const divider2 = this.add.rectangle(110, y, 190, 1, 3359846, .8);
			this.panel.add(divider2);
			y += 8;
			this.createPanelButton(15, y, "🌾 농업 개발 (-10💰)", () => {
				if (faction && faction.resources.gold >= 10) {
					faction.resources.gold -= 10;
					territory.development.agriculture = Math.min(100, territory.development.agriculture + 10);
					this.mapScene.addLog(`턴 ${this.gameState.turn}: ${territory.name}의 농업이 정비되었습니다.`);
					this.showTerritoryPanel(territory);
					this.updateResourcePanel();
				}
			});
			y += 38;
			this.createPanelButton(15, y, "💰 상업 개발 (-10🌾)", () => {
				if (faction && faction.resources.food >= 10) {
					faction.resources.food -= 10;
					territory.development.commerce = Math.min(100, territory.development.commerce + 10);
					this.mapScene.addLog(`턴 ${this.gameState.turn}: ${territory.name}의 상업 기반이 확장되었습니다.`);
					this.showTerritoryPanel(territory);
					this.updateResourcePanel();
				}
			});
			y += 38;
			this.createPanelButton(15, y, "⚔️ 병력 징집 (-15🌾)", () => {
				if (faction && faction.resources.food >= 15) {
					faction.resources.food -= 15;
					territory.garrison += 1e3;
					this.mapScene.addLog(`턴 ${this.gameState.turn}: ${territory.name}에서 병력 1,000명을 징집했습니다.`);
					this.showTerritoryPanel(territory);
					this.updateResourcePanel();
				}
			});
			y += 38;
			this.createPanelButton(15, y, "🛡️ 방어 강화 (-10💰)", () => {
				if (faction && faction.resources.gold >= 10) {
					faction.resources.gold -= 10;
					territory.development.defense = Math.min(100, territory.development.defense + 10);
					this.mapScene.addLog(`턴 ${this.gameState.turn}: ${territory.name}의 방어 시설이 강화되었습니다.`);
					this.showTerritoryPanel(territory);
					this.updateResourcePanel();
				}
			});
			y += 38;
			const localTargets = getAttackableTargets(faction, this.gameState).filter((t) => territory.adjacentTo.includes(t.id));
			if (localTargets.length > 0) {
				const divider3 = this.add.rectangle(110, y, 190, 1, 3359846, .8);
				this.panel.add(divider3);
				y += 6;
				addText(`⚔️ 공격 가능`, "#ff6b6b", "13px");
				for (const target of localTargets) {
					const defFaction = this.gameState.factions.find((f) => f.id === target.owner);
					this.createPanelButton(15, y, `⚔️ ${target.name} (${defFaction?.name})`, () => {
						if (!faction || !defFaction) return;
						const result = calculateBattle(faction, defFaction, target, this.gameState);
						this.mapScene.addLog(`턴 ${this.gameState.turn}: ${result.log}`);
						this.mapScene.refreshTerritoryVisuals?.();
						this.showBattleResultModal(result, faction, defFaction, target);
						this.updateResourcePanel();
					});
					y += 34;
				}
			}
		}
	}
	createPanelButton(x, y, text, callback) {
		const bg = this.add.rectangle(x + 95, y + 14, 190, 30, COLORS.button, .8).setStrokeStyle(1, 4487082).setInteractive({ useHandCursor: true });
		const label = this.add.text(x + 95, y + 14, text, {
			fontSize: "11px",
			color: "#ffffff",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		bg.on("pointerover", () => bg.setFillStyle(COLORS.buttonHover));
		bg.on("pointerout", () => bg.setFillStyle(COLORS.button));
		bg.on("pointerdown", callback);
		this.panel.add([bg, label]);
	}
	showBattleResultModal(result, attacker, defender, territory) {
		this.battleModal.removeAll(true);
		this.battleModal.setVisible(true);
		const overlay = this.add.rectangle(0, 0, 1280, 720, 0, .6).setInteractive();
		this.battleModal.add(overlay);
		const modal = this.add.rectangle(0, 0, 460, 340, COLORS.panel, .95).setStrokeStyle(2, COLORS.gold);
		this.battleModal.add(modal);
		const title = this.add.text(0, -140, "⚔️ 전투 결과", {
			fontSize: "22px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.battleModal.add(title);
		const resultColor = result.victor === "attacker" ? "#66ff66" : "#ff6666";
		const resultText = result.victor === "attacker" ? "🏆 승리 — 영토 점령!" : "💀 패배 — 공격 실패";
		const lines = [
			`${attacker.name} → ${territory.name} (${defender.name})`,
			``,
			`공격측 손실: ${result.attackerLosses.toLocaleString()}명`,
			`방어측 손실: ${result.defenderLosses.toLocaleString()}명`,
			``,
			result.territoryConquered ? `${territory.name}이(가) ${attacker.name}에 점령되었습니다.` : `${defender.name}이(가) ${territory.name}을(를) 사수했습니다.`
		];
		const desc = this.add.text(0, -60, lines.join("\n"), {
			fontSize: "14px",
			color: "#dddddd",
			fontFamily: "sans-serif",
			lineSpacing: 5,
			align: "center"
		}).setOrigin(.5, 0);
		this.battleModal.add(desc);
		const verdict = this.add.text(0, 80, resultText, {
			fontSize: "18px",
			color: resultColor,
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.battleModal.add(verdict);
		const btnBg = this.add.rectangle(0, 130, 140, 38, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
		const btnLabel = this.add.text(0, 130, "확인", {
			fontSize: "15px",
			color: "#ffffff",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		btnBg.on("pointerover", () => btnBg.setFillStyle(COLORS.buttonHover));
		btnBg.on("pointerout", () => btnBg.setFillStyle(COLORS.button));
		btnBg.on("pointerdown", () => {
			this.battleModal.setVisible(false);
			const selectedTerritory = this.gameState.territories.find((t) => t.id === territory.id);
			if (selectedTerritory) this.showTerritoryPanel(selectedTerritory);
		});
		this.battleModal.add([btnBg, btnLabel]);
	}
	getRelationLabel(value) {
		if (value >= 60) return {
			text: "동맹",
			color: "#66ff66"
		};
		if (value >= 30) return {
			text: "우호",
			color: "#88ddff"
		};
		if (value >= -10) return {
			text: "중립",
			color: "#cccccc"
		};
		if (value >= -40) return {
			text: "경계",
			color: "#ffaa44"
		};
		return {
			text: "적대",
			color: "#ff4444"
		};
	}
	showDiplomacyPanel() {
		this.diplomacyPanel.removeAll(true);
		this.diplomacyPanel.setVisible(true);
		const overlay = this.add.rectangle(0, 0, 1280, 720, 0, .6).setInteractive();
		this.diplomacyPanel.add(overlay);
		const player = this.gameState.factions.find((f) => f.isPlayer);
		if (!player) return;
		const otherFactions = this.gameState.factions.filter((f) => !f.isPlayer);
		const modalHeight = 120 + otherFactions.length * 100;
		const modal = this.add.rectangle(0, 0, 520, modalHeight, COLORS.panel, .95).setStrokeStyle(2, COLORS.gold);
		this.diplomacyPanel.add(modal);
		const title = this.add.text(0, -modalHeight / 2 + 25, "🤝 외교", {
			fontSize: "22px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.diplomacyPanel.add(title);
		let y = -modalHeight / 2 + 60;
		for (const faction of otherFactions) {
			const relation = getRelation(player.id, faction.id);
			const label = this.getRelationLabel(relation);
			const nameText = this.add.text(-230, y, `${faction.name}`, {
				fontSize: "15px",
				color: "#ffffff",
				fontFamily: "sans-serif"
			});
			this.diplomacyPanel.add(nameText);
			const relText = this.add.text(-230, y + 22, `관계: ${relation} (${label.text})`, {
				fontSize: "12px",
				color: label.color,
				fontFamily: "sans-serif"
			});
			this.diplomacyPanel.add(relText);
			const tradeBg = this.add.rectangle(80, y + 14, 130, 32, COLORS.button, .9).setStrokeStyle(1, 4487082).setInteractive({ useHandCursor: true });
			const tradeLabel = this.add.text(80, y + 14, "💰 교역 제안", {
				fontSize: "12px",
				color: "#ffffff",
				fontFamily: "sans-serif"
			}).setOrigin(.5);
			tradeBg.on("pointerover", () => tradeBg.setFillStyle(COLORS.buttonHover));
			tradeBg.on("pointerout", () => tradeBg.setFillStyle(COLORS.button));
			tradeBg.on("pointerdown", () => {
				const result = proposeTrade({
					from: player.id,
					to: faction.id,
					offer: { food: 20 },
					demand: { gold: 20 }
				}, this.gameState.factions);
				this.mapScene.addLog(`턴 ${this.gameState.turn}: ${faction.name}에 교역 제안 → ${result.reason}`);
				this.updateResourcePanel();
				this.showDiplomacyPanel();
			});
			this.diplomacyPanel.add([tradeBg, tradeLabel]);
			const canAlly = relation >= 30;
			const allyColor = canAlly ? COLORS.button : 1714751;
			const allyBg = this.add.rectangle(210, y + 14, 130, 32, allyColor, .9).setStrokeStyle(1, canAlly ? 4487082 : 3355443);
			if (canAlly) allyBg.setInteractive({ useHandCursor: true });
			const allyLabel = this.add.text(210, y + 14, "🤝 동맹 제안", {
				fontSize: "12px",
				color: canAlly ? "#ffffff" : "#666666",
				fontFamily: "sans-serif"
			}).setOrigin(.5);
			if (canAlly) {
				allyBg.on("pointerover", () => allyBg.setFillStyle(COLORS.buttonHover));
				allyBg.on("pointerout", () => allyBg.setFillStyle(COLORS.button));
				allyBg.on("pointerdown", () => {
					const result = proposeAlliance(player, faction);
					this.mapScene.addLog(`턴 ${this.gameState.turn}: ${faction.name}에 동맹 제안 → ${result.reason}`);
					this.showDiplomacyPanel();
				});
			}
			this.diplomacyPanel.add([allyBg, allyLabel]);
			const terrCount = this.gameState.territories.filter((t) => t.owner === faction.id).length;
			const infoText = this.add.text(-230, y + 42, `영토 ${terrCount}개 | 병력 ${faction.territories.length > 0 ? this.gameState.territories.filter((t) => t.owner === faction.id).reduce((s, t) => s + t.garrison, 0).toLocaleString() : "0"}명`, {
				fontSize: "11px",
				color: "#888888",
				fontFamily: "sans-serif"
			});
			this.diplomacyPanel.add(infoText);
			y += 90;
		}
		const closeBg = this.add.rectangle(0, modalHeight / 2 - 35, 120, 34, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
		const closeLabel = this.add.text(0, modalHeight / 2 - 35, "닫기", {
			fontSize: "14px",
			color: "#ffffff",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		closeBg.on("pointerover", () => closeBg.setFillStyle(COLORS.buttonHover));
		closeBg.on("pointerout", () => closeBg.setFillStyle(COLORS.button));
		closeBg.on("pointerdown", () => {
			this.diplomacyPanel.setVisible(false);
		});
		this.diplomacyPanel.add([closeBg, closeLabel]);
	}
	showEventModal(event) {
		this.eventPanel.removeAll(true);
		this.eventPanel.setVisible(true);
		const overlay = this.add.rectangle(0, 0, 1280, 720, 0, .6).setInteractive();
		this.eventPanel.add(overlay);
		const modal = this.add.rectangle(0, 0, 500, 380, COLORS.panel, .95).setStrokeStyle(2, COLORS.gold);
		this.eventPanel.add(modal);
		const title = this.add.text(0, -160, event.title, {
			fontSize: "22px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.eventPanel.add(title);
		const desc = this.add.text(0, -80, event.description, {
			fontSize: "14px",
			color: "#dddddd",
			fontFamily: "sans-serif",
			wordWrap: { width: 440 },
			lineSpacing: 4
		}).setOrigin(.5, 0);
		this.eventPanel.add(desc);
		const ref = this.add.text(0, 60, `📖 ${event.textbookRef}`, {
			fontSize: "12px",
			color: "#88aacc",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.eventPanel.add(ref);
		if (event.choices) event.choices.forEach((choice, i) => {
			const btnY = 100 + i * 50;
			const btnBg = this.add.rectangle(0, btnY, 420, 38, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
			const btnText = this.add.text(0, btnY, choice.text, {
				fontSize: "14px",
				color: "#ffffff",
				fontFamily: "sans-serif"
			}).setOrigin(.5);
			btnBg.on("pointerover", () => btnBg.setFillStyle(COLORS.buttonHover));
			btnBg.on("pointerout", () => btnBg.setFillStyle(COLORS.button));
			btnBg.on("pointerdown", () => {
				const player = this.gameState.factions.find((f) => f.isPlayer);
				if (player && choice.effect) for (const [key, value] of Object.entries(choice.effect)) player.resources[key] += value;
				this.updateResourcePanel();
				this.eventPanel.setVisible(false);
				this.mapScene.addLog(`턴 ${this.gameState.turn}: ${event.title} - ${choice.resultText}`);
			});
			this.eventPanel.add([btnBg, btnText]);
		});
	}
	showQuizModal(quiz) {
		this.quizCloseTimer?.remove(false);
		this.quizPanel.removeAll(true);
		this.quizPanel.setVisible(true);
		let answered = false;
		const overlay = this.add.rectangle(0, 0, 1280, 720, 0, .6).setInteractive();
		this.quizPanel.add(overlay);
		const modal = this.add.rectangle(0, 0, 520, 420, COLORS.panel, .95).setStrokeStyle(2, COLORS.gold);
		this.quizPanel.add(modal);
		const title = this.add.text(0, -170, "📝 교과서 퀴즈", {
			fontSize: "22px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.quizPanel.add(title);
		const question = this.add.text(0, -120, quiz.question, {
			fontSize: "18px",
			color: "#f4f0e6",
			fontFamily: "sans-serif",
			wordWrap: { width: 440 },
			align: "center",
			lineSpacing: 6
		}).setOrigin(.5);
		this.quizPanel.add(question);
		const textbookRef = this.add.text(0, -52, `📖 ${quiz.textbookRef}`, {
			fontSize: "12px",
			color: "#88aacc",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.quizPanel.add(textbookRef);
		const resultText = this.add.text(0, 120, "", {
			fontSize: "18px",
			color: "#dddddd",
			fontFamily: "sans-serif",
			wordWrap: { width: 430 },
			align: "center",
			lineSpacing: 5
		}).setOrigin(.5);
		this.quizPanel.add(resultText);
		const answerRefText = this.add.text(0, 165, "", {
			fontSize: "13px",
			color: "#88aacc",
			fontFamily: "sans-serif",
			wordWrap: { width: 430 },
			align: "center"
		}).setOrigin(.5);
		this.quizPanel.add(answerRefText);
		const answerButtons = [];
		const answerLabels = [];
		const choiceTexts = quiz.type === "ox" ? ["O", "X"] : quiz.options ?? [];
		const startY = quiz.type === "ox" ? -10 : -25;
		const lockAnswers = () => {
			answerButtons.forEach((button) => button.disableInteractive());
		};
		const showCloseButton = () => {
			const closeBg = this.add.rectangle(0, 205, 140, 36, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
			const closeText = this.add.text(0, 205, "확인", {
				fontSize: "14px",
				color: "#ffffff",
				fontFamily: "sans-serif"
			}).setOrigin(.5);
			closeBg.on("pointerover", () => closeBg.setFillStyle(COLORS.buttonHover));
			closeBg.on("pointerout", () => closeBg.setFillStyle(COLORS.button));
			closeBg.on("pointerdown", () => this.closeQuizModal());
			this.quizPanel.add([closeBg, closeText]);
		};
		const submitAnswer = (selectedAnswer) => {
			if (answered) return;
			answered = true;
			lockAnswers();
			const isCorrect = selectedAnswer === quiz.answer;
			const playerFaction = this.gameState.factions.find((f) => f.isPlayer);
			if (isCorrect && playerFaction) {
				for (const [key, value] of Object.entries(quiz.reward)) playerFaction.resources[key] += value ?? 0;
				this.updateResourcePanel();
			}
			const rewardText = this.formatRewardText(quiz.reward);
			if (isCorrect) {
				resultText.setColor("#7CFFB2");
				resultText.setText(`✅ 정답! ${rewardText}`);
				answerRefText.setText("");
				this.mapScene.addLog(`턴 ${this.gameState.turn}: 퀴즈 정답 - ${rewardText}`);
			} else {
				resultText.setColor("#FF8A8A");
				resultText.setText(`❌ 오답! 정답은 ${quiz.answer}`);
				answerRefText.setText(`교과서 참조: ${quiz.textbookRef}`);
				this.mapScene.addLog(`턴 ${this.gameState.turn}: 퀴즈 오답 - 정답 ${quiz.answer}`);
			}
			showCloseButton();
			this.quizCloseTimer = this.time.delayedCall(2e3, () => {
				this.closeQuizModal();
			});
		};
		choiceTexts.forEach((choice, index) => {
			const buttonY = startY + index * 52;
			const buttonBg = this.add.rectangle(0, buttonY, 430, 40, COLORS.button, .9).setStrokeStyle(1, 5605563).setInteractive({ useHandCursor: true });
			const buttonText = this.add.text(0, buttonY, choice, {
				fontSize: "15px",
				color: "#ffffff",
				fontFamily: "sans-serif",
				wordWrap: { width: 390 },
				align: "center"
			}).setOrigin(.5);
			buttonBg.on("pointerover", () => {
				if (!answered) buttonBg.setFillStyle(COLORS.buttonHover);
			});
			buttonBg.on("pointerout", () => {
				if (!answered) buttonBg.setFillStyle(COLORS.button);
			});
			buttonBg.on("pointerdown", () => submitAnswer(choice));
			answerButtons.push(buttonBg);
			answerLabels.push(buttonText);
			this.quizPanel.add([buttonBg, buttonText]);
		});
	}
	closeQuizModal() {
		this.quizCloseTimer?.remove(false);
		this.quizCloseTimer = void 0;
		this.quizPanel.setVisible(false);
		this.quizPanel.removeAll(true);
	}
	formatRewardText(reward) {
		const rewardLabels = {
			food: "식량",
			gold: "재화",
			culture: "문화",
			military: "군사",
			technology: "기술"
		};
		return Object.entries(reward).map(([key, value]) => `${rewardLabels[key]} +${value}`).join(", ");
	}
	handleMenuCommand(digit) {
		this.setActiveMenu(digit);
		const mapScene = this.scene.get("MapScene");
		switch (digit) {
			case 3:
				this.showDiplomacyPanel();
				break;
			default:
				mapScene?.addLog?.(`턴 ${this.gameState.turn}: [메뉴 ${digit}] 명령을 준비 중입니다.`);
				break;
		}
	}
	showTutorialModal() {
		this.tutorialPanel.removeAll(true);
		this.tutorialPanel.setVisible(true);
		const overlay = this.add.rectangle(0, 0, 1280, 720, 0, .6).setInteractive();
		this.tutorialPanel.add(overlay);
		const modal = this.add.rectangle(0, 0, 500, 340, COLORS.panel, .95).setStrokeStyle(2, COLORS.gold);
		this.tutorialPanel.add(modal);
		const title = this.add.text(0, -140, "🏛️ 역사 전략 시뮬레이터", {
			fontSize: "22px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		this.tutorialPanel.add(title);
		const welcomeText = [
			"역사 전략 시뮬레이터에 오신 걸 환영합니다!",
			"",
			"1. 도시를 클릭하여 내정을 관리하세요",
			"2. 턴 종료로 다음 턴으로",
			"3. 교과서 퀴즈에 정답하면 보상!",
			"",
			"방향키로 도시 이동, 숫자키로 메뉴"
		].join("\n");
		const desc = this.add.text(0, -40, welcomeText, {
			fontSize: "14px",
			color: "#dddddd",
			fontFamily: "sans-serif",
			lineSpacing: 6,
			align: "center",
			wordWrap: { width: 420 }
		}).setOrigin(.5, 0);
		this.tutorialPanel.add(desc);
		const btnBg = this.add.rectangle(0, 130, 180, 40, COLORS.button, .9).setStrokeStyle(1, COLORS.gold, .7).setInteractive({ useHandCursor: true });
		const btnLabel = this.add.text(0, 130, "🎮 게임 시작!", {
			fontSize: "16px",
			color: "#f0c040",
			fontFamily: "sans-serif"
		}).setOrigin(.5);
		btnBg.on("pointerover", () => btnBg.setFillStyle(COLORS.buttonHover));
		btnBg.on("pointerout", () => btnBg.setFillStyle(COLORS.button));
		btnBg.on("pointerdown", () => {
			this.tutorialPanel.setVisible(false);
		});
		this.tutorialPanel.add([btnBg, btnLabel]);
	}
};
//#endregion
//#region src/main.ts
var config = {
	type: import_phaser.default.AUTO,
	width: 1280,
	height: 720,
	parent: "app",
	backgroundColor: "#1a1a2e",
	scene: [
		BootScene,
		TitleScene,
		MapScene,
		UIScene
	],
	scale: {
		mode: import_phaser.default.Scale.FIT,
		autoCenter: import_phaser.default.Scale.CENTER_BOTH
	},
	pixelArt: false
};
new import_phaser.default.Game(config);
//#endregion
