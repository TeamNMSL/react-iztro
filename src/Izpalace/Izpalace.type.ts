// src/Izpalace/Izpalace.type.ts
import { Palace } from "iztro/lib/data/Palace";
import { Horoscope } from "iztro/lib/data/Horoscope";
import { HeavenlyStemKey, Scope } from "iztro/lib/i18n";

export interface IzpalaceProps extends Palace {
  index: number;
  taichiPalace?: string;
  focusedIndex?: number;
  onFocused?: (index: number | undefined) => void;
  horoscope?: Horoscope;
  activeHeavenlyStem?: HeavenlyStemKey;
  toggleActiveHeavenlyStem?: (stem: HeavenlyStemKey) => void;
  hoverHeavenlyStem?: HeavenlyStemKey;
  setHoverHeavenlyStem?: (stem: HeavenlyStemKey | undefined) => void;
  showDecadalScope?: boolean;
  showYearlyScope?: boolean;
  showMonthlyScope?: boolean;
  showDailyScope?: boolean;
  showHourlyScope?: boolean;
  toggleScope?: (scope: Scope) => void;
  toggleTaichiPoint?: (index: number) => void;
  // 新增解析回调函数类型
  onShowAnalysis?: (title: string, e: React.MouseEvent) => void;
}