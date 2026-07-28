/*
 * 화장품 포장재 재질·구조 간이평가 - 판정 규칙 데이터
 *
 * 근거: 환경부고시 「포장재 재활용 용이성 등급평가 기준」 및 「포장재 재질·구조 등급표시 기준」
 *  - 최초 제정: 환경부고시 제2019-269호 등 (2019.12.25 시행), 가이드라인 "포장재 재질·구조 평가제도의 이해"(환경부, 2020.2)
 *  - 개정 반영: 2021.1.7 시행 개정(페트병 최우수 확대, 유리병 표면코팅 완화 등),
 *               2025.1.7 시행 환경부고시 제2025-2호(최우수 등급 대상 확대: 페트병·PSP·유리병·합성수지 단일재질 용기·트레이류)
 *  - 최종 갱신일: 2026-07-28 (공개된 고시·보도자료·환경부 가이드라인을 기준으로 조사·구성)
 *
 * 주의: 이 파일은 "간이 자가진단"을 위한 근사 규칙입니다. 접착제 도포면적, 비중 등
 * 기기분석이 필요한 정량 기준은 실제로는 공인시험기관 시험성적서로 확인해야 하며,
 * 최종 등급은 한국환경공단(www.iepr.or.kr) 평가결과서로 확정됩니다.
 */

const GRADE = { ELITE: 3, GOOD: 2, NORMAL: 1, POOR: 0 };

const GRADE_META = {
  3: { key: "elite", label: "재활용 최우수", short: "최우수", badge: "★", className: "grade-elite" },
  2: { key: "good", label: "재활용 우수", short: "우수", badge: "●", className: "grade-good" },
  1: { key: "normal", label: "재활용 보통", short: "보통", badge: "●", className: "grade-normal" },
  0: { key: "poor", label: "재활용 어려움", short: "어려움", badge: "▲", className: "grade-poor" },
};

// 카테고리별 최우수 등급 허용 여부 (근거: 환경부고시 2025-2호 - 페트병, PSP, 유리병, 합성수지 단일재질 용기·트레이류 4종)
const ELITE_ALLOWED = {
  glass: true,
  pet_bottle: true,
  rigid_container: true,
  composite: false,
  metal_can: false,
};

/* ------------------------------------------------------------------ */
/* 공통 유틸: 옵션 목록 중 최소 등급을 종합 등급으로 반환               */
/* ------------------------------------------------------------------ */
function minGrade(...grades) {
  return grades.reduce((a, b) => (b < a ? b : a));
}

/* ------------------------------------------------------------------ */
/* 카테고리 정의                                                       */
/* ------------------------------------------------------------------ */
const CATEGORIES = {
  glass: {
    id: "glass",
    name: "유리병",
    icon: "🫙",
    examples: "스킨·토너·향수·앰플 유리 용기 등",
    desc: "목과 마개가 있는 유리 재질 용기",
    parts: [
      {
        id: "body_color",
        title: "몸체 색상",
        question: "유리 용기 몸체의 색상은 무엇인가요?",
        help: "안료나 염료를 넣지 않은 투명한 유리가 '무색'입니다.",
        options: [
          { value: "colorless", label: "무색(투명)", grade: GRADE.GOOD, tag: "eliteColor" },
          { value: "brown", label: "갈색", grade: GRADE.GOOD },
          { value: "green", label: "녹색", grade: GRADE.GOOD },
          { value: "other", label: "그 외 색상 (파란색, 유색 불투명 등)", grade: GRADE.POOR },
        ],
      },
      {
        id: "body_coating",
        title: "몸체 표면 가공",
        question: "몸체 표면에 도색·코팅(스프레이 도장, 매트 코팅 등)이 되어 있나요?",
        help: "색을 입히는 스프레이 도장, 프로스팅(무광) 코팅 등이 해당됩니다. 유색 유리 자체가 아니라 '표면 가공 여부'를 묻는 질문입니다.",
        options: [
          { value: "no", label: "아니요, 가공 없음", grade: GRADE.GOOD, tag: "noCoating" },
          { value: "yes", label: "네, 도색·코팅 있음", grade: GRADE.NORMAL },
        ],
      },
      {
        id: "label",
        title: "라벨",
        question: "라벨은 어떻게 부착되어 있나요?",
        options: [
          { value: "none", label: "라벨 없음 (또는 제조일자·유통기한만 표시)", grade: GRADE.GOOD },
          { value: "paper", label: "종이 라벨", grade: GRADE.GOOD },
          { value: "shrink_cut", label: "비접착식 합성수지 라벨(수축·스트레치) + 절취선 있음", grade: GRADE.GOOD },
          { value: "shrink_nocut", label: "비접착식 합성수지 라벨, 절취선 없음", grade: GRADE.NORMAL },
          { value: "adhesive_removable", label: "접착식 합성수지 라벨, 몸체와 분리 가능", grade: GRADE.NORMAL },
          { value: "adhesive_fixed", label: "접착식 합성수지 라벨, 몸체와 분리 불가능", grade: GRADE.POOR },
          { value: "direct_print", label: "몸체에 직접 인쇄(제조일자·유통기한 표시 제외)", grade: GRADE.POOR },
          { value: "metal_mixed", label: "금속(알루미늄 등)이 혼입된 라벨", grade: GRADE.POOR },
          { value: "pvc", label: "PVC 계열 재질 라벨", grade: GRADE.POOR, warnBanned: true },
        ],
      },
      {
        id: "cap",
        title: "마개 및 잡자재",
        question: "마개(뚜껑)와 부속품(펌프, 스포이드, 잡자재 등)은 어떤 구조인가요?",
        help: "'뚜껑·테 분리형'은 뚜껑을 열 때 링(테)만 병목에 남는 구조, '일체형'은 뚜껑과 테가 함께 빠지는 구조입니다.",
        options: [
          { value: "cap_body_together", label: "뚜껑·테 일체형 (열면 뚜껑과 테가 함께 빠짐)", grade: GRADE.GOOD },
          { value: "cap_separable", label: "그 외 몸체와 분리 가능한 마개·펌프·스포이드", grade: GRADE.GOOD },
          { value: "metal_coated", label: "합성수지를 덧씌운 금속 마개", grade: GRADE.POOR },
          { value: "cap_ring_left", label: "뚜껑·테 분리형 (열면 링이 병목에 남음)", grade: GRADE.POOR },
          { value: "cap_fixed", label: "몸체와 분리 불가능한 마개·부속", grade: GRADE.POOR },
        ],
      },
    ],
    evaluate(answers) {
      const bodyColorOpt = findOption(this, "body_color", answers.body_color);
      const bodyCoatOpt = findOption(this, "body_coating", answers.body_coating);
      const labelOpt = findOption(this, "label", answers.label);
      const capOpt = findOption(this, "cap", answers.cap);

      const bodyGrade = minGrade(bodyColorOpt.grade, bodyCoatOpt.grade);
      const overall = minGrade(bodyGrade, labelOpt.grade, capOpt.grade);

      const eliteEligible =
        ELITE_ALLOWED.glass &&
        bodyColorOpt.tag === "eliteColor" &&
        bodyCoatOpt.tag === "noCoating" &&
        labelOpt.grade >= GRADE.GOOD &&
        capOpt.grade >= GRADE.GOOD;

      const finalGrade = overall >= GRADE.GOOD && eliteEligible ? GRADE.ELITE : overall;

      return {
        finalGrade,
        components: [
          { title: "몸체", grade: bodyGrade },
          { title: "라벨", grade: labelOpt.grade },
          { title: "마개 및 잡자재", grade: capOpt.grade },
        ],
        notes: buildBannedNotes([labelOpt]),
      };
    },
  },

  pet_bottle: {
    id: "pet_bottle",
    name: "페트병",
    icon: "🧴",
    examples: "목과 나사식 마개가 있는 PET 재질 토너·샴푸·바디워시 용기 등",
    desc: "목(구경)과 마개가 있는 음료병 형태의 PET 단일재질 용기",
    parts: [
      {
        id: "body",
        title: "몸체",
        question: "PET 용기 몸체의 재질·색상은 어떤가요?",
        options: [
          { value: "colorless_single", label: "무색(투명) 단일재질", grade: GRADE.GOOD, tag: "eliteBody" },
          { value: "green_single", label: "녹색 단일재질", grade: GRADE.NORMAL },
          { value: "colored", label: "그 외 유색(녹색 제외)", grade: GRADE.POOR },
          { value: "petg_mixed", label: "글리콜변성 PET(PET-G) 혼합", grade: GRADE.POOR },
          { value: "composite", label: "PET 이외 재질과 복합", grade: GRADE.POOR },
        ],
      },
      {
        id: "label",
        title: "라벨",
        question: "라벨은 어떻게 부착되어 있나요?",
        help: "'열알칼리성 분리 접착제'는 재활용 세척 공정(80℃·수산화나트륨 2%)에서 라벨이 저절로 떨어지도록 설계된 특수 접착제입니다. 라벨 부자재 업체에 이 접착제 사용 여부를 확인하면 됩니다.",
        options: [
          { value: "none", label: "라벨 없음", grade: GRADE.GOOD, tag: "elite" },
          { value: "cap_only", label: "라벨이 마개에만 붙어 있어 마개를 열면 라벨도 같이 분리됨", grade: GRADE.GOOD, tag: "elite" },
          { value: "cut_line_nonadhesive", label: "비중 1미만 + 절취선 있는 비접착식 라벨", grade: GRADE.GOOD, tag: "elite" },
          { value: "tiny_adhesive", label: "비중 1미만 + 열알칼리성 분리 접착제 극소량(라벨의 0.5% 미만, 가장자리 미도포)", grade: GRADE.GOOD, tag: "elite" },
          { value: "thermo_adhesive_ok", label: "비중 1미만 + 열알칼리성 분리 접착제(도포면적 기준 충족, 가장자리 미도포)", grade: GRADE.GOOD },
          { value: "nonadhesive_nocut", label: "비중 1미만 + 비접착식 라벨, 절취선 없음", grade: GRADE.NORMAL },
          { value: "thermo_adhesive_edge", label: "비중 1미만 + 열알칼리성 분리 접착제(가장자리까지 도포)", grade: GRADE.NORMAL },
          { value: "thermo_adhesive_over", label: "비중 1미만 + 열알칼리성 분리 접착제(도포면적 기준 초과)", grade: GRADE.NORMAL },
          { value: "heavy_cutline", label: "비중 1이상 합성수지 + 절취선 있음", grade: GRADE.NORMAL },
          { value: "heavy_nocut", label: "비중 1이상 합성수지, 절취선 없음/가장자리 도포", grade: GRADE.POOR },
          { value: "general_adhesive", label: "일반 접착제(열알칼리성 분리 불가) 사용", grade: GRADE.POOR },
          { value: "direct_print", label: "몸체에 직접 인쇄(제조일자·유통기한 표시 제외)", grade: GRADE.POOR },
          { value: "pvc", label: "PVC 계열 재질", grade: GRADE.POOR, warnBanned: true },
          { value: "metal_mixed", label: "금속 혼입 재질", grade: GRADE.POOR },
          { value: "nonplastic", label: "합성수지 이외 재질(특수 필름 등)", grade: GRADE.POOR },
        ],
      },
      {
        id: "cap",
        title: "마개 및 잡자재",
        question: "마개·펌프·잡자재는 어떤 재질인가요?",
        help: "'비중 1미만 합성수지'는 물에 뜨는 재질(PP, PE 등), '비중 1이상'은 물에 가라앉는 재질입니다(예: PET, POM 등 일부 엔지니어링 플라스틱).",
        options: [
          { value: "colorless_pet", label: "무색 PET 단일재질", grade: GRADE.GOOD },
          { value: "light_plastic", label: "비중 1미만의 합성수지(PP 등)", grade: GRADE.GOOD },
          { value: "nonplastic_full_separable", label: "합성수지 이외 재질(금속 스프링 펌프 등)이지만 완전 분리 가능", grade: GRADE.NORMAL },
          { value: "heavy_plastic", label: "비중 1이상의 합성수지", grade: GRADE.NORMAL },
          { value: "nonplastic_light_mixed", label: "합성수지 이외 재질이 섞인 비중 1미만 잡자재", grade: GRADE.NORMAL },
          { value: "pvc", label: "PVC 계열 재질", grade: GRADE.POOR, warnBanned: true },
        ],
      },
    ],
    evaluate(answers) {
      const bodyOpt = findOption(this, "body", answers.body);
      const labelOpt = findOption(this, "label", answers.label);
      const capOpt = findOption(this, "cap", answers.cap);

      const overall = minGrade(bodyOpt.grade, labelOpt.grade, capOpt.grade);
      const eliteEligible =
        ELITE_ALLOWED.pet_bottle &&
        labelOpt.tag === "elite" &&
        bodyOpt.grade >= GRADE.GOOD &&
        capOpt.grade >= GRADE.GOOD;

      const finalGrade = overall >= GRADE.GOOD && eliteEligible ? GRADE.ELITE : overall;

      return {
        finalGrade,
        components: [
          { title: "몸체", grade: bodyOpt.grade },
          { title: "라벨", grade: labelOpt.grade },
          { title: "마개 및 잡자재", grade: capOpt.grade },
        ],
        notes: buildBannedNotes([bodyOpt, labelOpt, capOpt]),
      };
    },
  },

  rigid_container: {
    id: "rigid_container",
    name: "합성수지 단일용기·트레이",
    icon: "🧴",
    examples: "크림 자, 쿠션 케이스, 목 없는 로션 용기, 컴팩트 트레이 등",
    desc: "목(구경)과 나사 마개가 없는 PE·PP·PS·PET 등 단일재질 용기/트레이",
    parts: [
      {
        id: "body",
        title: "몸체",
        question: "용기 몸체의 재질은 무엇인가요?",
        options: [
          { value: "pe_pp_ps_etc", label: "PE / PP / PS 등 PET 이외의 단일재질", grade: GRADE.GOOD },
          { value: "pet_colorless", label: "PET 단일재질, 무색(투명)", grade: GRADE.GOOD, tag: "elitePet" },
          { value: "petg_mixed", label: "PET-G 수지가 혼합된 PET", grade: GRADE.POOR },
          { value: "pet_colored", label: "PET 단일재질이지만 유색", grade: GRADE.POOR },
          { value: "pvc", label: "PVC 계열", grade: GRADE.POOR, warnBanned: true },
        ],
      },
      {
        id: "label_cap",
        title: "라벨·마개 및 잡자재",
        question: "라벨/마개/뚜껑 등 부속은 몸체와 어떤 관계인가요?",
        help: "몸체가 PET인지 아닌지에 따라 기준이 달라지므로, 위에서 선택한 몸체 재질을 기준으로 가장 가까운 항목을 골라주세요.",
        options: [
          { value: "none", label: "미사용 (라벨·마개·잡자재 없음)", grade: GRADE.GOOD, tag: "none" },
          { value: "direct_print", label: "몸체에 직접 인쇄", grade: GRADE.GOOD },
          { value: "nonadhesive", label: "비접착식 라벨/마개", grade: GRADE.GOOD },
          { value: "same_material", label: "몸체와 동일 계열 재질(예: 몸체 PP + 마개 PE)", grade: GRADE.GOOD },
          { value: "diff_fully_separable", label: "몸체와 다른 합성수지지만 완전 분리 가능", grade: GRADE.GOOD },
          { value: "adhesive", label: "접착식 라벨(PET 몸체) / 몸체와 다른 재질로 분리는 가능(완전분리 아님)", grade: GRADE.NORMAL },
          { value: "child_safety", label: "어린이보호포장 기준 준수를 위해 분리 불가능하게 설계", grade: GRADE.NORMAL },
          { value: "pvc", label: "PVC 계열 재질", grade: GRADE.POOR, warnBanned: true },
          { value: "diff_not_separable", label: "몸체와 다른 재질로 분리 불가능", grade: GRADE.POOR },
          { value: "straw", label: "합성수지 이외 재질이 포함된 리드·마개 + 빨대 부착", grade: GRADE.POOR },
        ],
      },
    ],
    evaluate(answers) {
      const bodyOpt = findOption(this, "body", answers.body);
      const lcOpt = findOption(this, "label_cap", answers.label_cap);

      const overall = minGrade(bodyOpt.grade, lcOpt.grade);
      const eliteEligible = ELITE_ALLOWED.rigid_container && bodyOpt.tag === "elitePet" && lcOpt.tag === "none";
      const finalGrade = overall >= GRADE.GOOD && eliteEligible ? GRADE.ELITE : overall;

      return {
        finalGrade,
        components: [
          { title: "몸체", grade: bodyOpt.grade },
          { title: "라벨·마개 및 잡자재", grade: lcOpt.grade },
        ],
        notes: buildBannedNotes([bodyOpt, lcOpt]),
      };
    },
  },

  composite: {
    id: "composite",
    name: "복합재질 용기·트레이 / 필름·시트류",
    icon: "🧃",
    examples: "튜브(다층 라미네이트), 리필 파우치, 샘플 봉지, 블리스터 포장 등",
    desc: "2가지 이상 재질이 결합된 용기·트레이, 또는 필름·시트형 포장재",
    parts: [
      {
        id: "body",
        title: "몸체",
        question: "몸체(튜브/파우치/필름)는 어떤 구조인가요?",
        options: [
          { value: "composite_container", label: "복합재질 용기·트레이 (합성수지 2종 이상, 또는 합성수지+비합성수지)", grade: GRADE.GOOD },
          { value: "film_al_thin", label: "필름·시트류 (알루미늄을 포함해도 두께 20㎛ 이하)", grade: GRADE.GOOD },
          { value: "film_al_thick", label: "필름·시트류, 알루미늄 두께 20㎛ 초과", grade: GRADE.NORMAL },
          { value: "nonplastic_mixed", label: "합성수지 이외 재질과 병합 사용 (알루미늄 20㎛ 이하 제외)", grade: GRADE.POOR },
          { value: "pvc", label: "PVC 계열 재질", grade: GRADE.POOR, warnBanned: true },
        ],
      },
      {
        id: "label_cap",
        title: "라벨·마개 및 잡자재",
        question: "라벨/캡/잡자재는 몸체와 어떤 관계인가요?",
        options: [
          { value: "none_or_print", label: "미사용 / 합성수지 재질 / 몸체 직접 인쇄", grade: GRADE.GOOD },
          { value: "separable", label: "합성수지 이외 재질이지만 몸체와 분리 가능", grade: GRADE.NORMAL },
          { value: "pvc", label: "PVC 계열 재질", grade: GRADE.POOR, warnBanned: true },
          { value: "not_separable", label: "합성수지 이외 재질로 몸체와 분리 불가능", grade: GRADE.POOR },
        ],
      },
    ],
    evaluate(answers) {
      const bodyOpt = findOption(this, "body", answers.body);
      const lcOpt = findOption(this, "label_cap", answers.label_cap);
      const overall = minGrade(bodyOpt.grade, lcOpt.grade);
      return {
        finalGrade: overall,
        components: [
          { title: "몸체", grade: bodyOpt.grade },
          { title: "라벨·마개 및 잡자재", grade: lcOpt.grade },
        ],
        notes: buildBannedNotes([bodyOpt, lcOpt]),
      };
    },
  },

  metal_can: {
    id: "metal_can",
    name: "금속캔 (스프레이·에어로졸)",
    icon: "🧯",
    examples: "헤어스프레이, 선케어 스프레이, 무스형 클렌저 등 에어로졸 캔",
    desc: "철 또는 알루미늄 재질의 스프레이·에어로졸 캔",
    parts: [
      {
        id: "body",
        title: "몸체",
        question: "캔의 주재질과 구조는 어떤가요?",
        options: [
          { value: "steel_single", label: "철(스틸) 단일재질", grade: GRADE.GOOD, tag: "steel" },
          { value: "alu_single", label: "알루미늄 단일재질", grade: GRADE.GOOD, tag: "alu" },
          { value: "steel_composite", label: "철 + 다른 재질이 결합된 복합구조", grade: GRADE.NORMAL, tag: "steel" },
          { value: "alu_composite", label: "알루미늄 + 다른 재질이 결합된 복합구조", grade: GRADE.POOR, tag: "alu" },
        ],
      },
      {
        id: "label",
        title: "라벨",
        question: "라벨은 어떻게 되어 있나요?",
        options: [
          { value: "none_or_print", label: "라벨 없음 / 몸체 직접 인쇄", grade: GRADE.GOOD },
          { value: "attached_removable", label: "라벨 부착, 몸체와 분리 가능", grade: GRADE.NORMAL },
          { value: "attached_fixed", label: "라벨 부착, 몸체와 분리 불가능 (알루미늄캔만 해당 시 어려움)", grade: GRADE.NORMAL, gradeAluOverride: GRADE.POOR },
        ],
      },
      {
        id: "cap",
        title: "마개 및 분사 부속(액추에이터 등)",
        question: "분사 버튼·마개 등 부속은 몸체와 어떤 관계인가요?",
        options: [
          { value: "same_or_alu", label: "몸체와 동일 재질, 또는 알루미늄 재질", grade: GRADE.GOOD },
          { value: "diff_removable", label: "몸체와 다른 재질이지만 분리 가능", grade: GRADE.NORMAL },
          { value: "diff_fixed", label: "몸체와 다른 재질로 분리 불가능 (알루미늄캔만 해당 시 어려움)", grade: GRADE.NORMAL, gradeAluOverride: GRADE.POOR },
        ],
      },
    ],
    evaluate(answers) {
      const bodyOpt = findOption(this, "body", answers.body);
      const labelOpt = findOption(this, "label", answers.label);
      const capOpt = findOption(this, "cap", answers.cap);
      const isAlu = bodyOpt.tag === "alu";

      const labelGrade = isAlu && labelOpt.gradeAluOverride !== undefined ? labelOpt.gradeAluOverride : labelOpt.grade;
      const capGrade = isAlu && capOpt.gradeAluOverride !== undefined ? capOpt.gradeAluOverride : capOpt.grade;

      const overall = minGrade(bodyOpt.grade, labelGrade, capGrade);
      return {
        finalGrade: overall,
        components: [
          { title: "몸체", grade: bodyOpt.grade },
          { title: "라벨", grade: labelGrade },
          { title: "마개 및 분사 부속", grade: capGrade },
        ],
        notes: buildBannedNotes([bodyOpt, labelOpt, capOpt]),
      };
    },
  },
};

/* ------------------------------------------------------------------ */
/* 헬퍼 함수                                                            */
/* ------------------------------------------------------------------ */
function findOption(category, partId, value) {
  const part = category.parts.find((p) => p.id === partId);
  const opt = part.options.find((o) => o.value === value);
  return opt;
}

function buildBannedNotes(options) {
  const banned = options.filter((o) => o && o.warnBanned);
  if (banned.length === 0) return [];
  return [
    "선택하신 항목 중 PVC 계열 재질이 포함되어 있습니다. PVC 계열은 「포장재의 재질·구조 기준」(환경부고시)상 사용이 금지된 재질이므로, 등급 판정과 별개로 재질 변경 검토가 시급합니다.",
  ];
}
