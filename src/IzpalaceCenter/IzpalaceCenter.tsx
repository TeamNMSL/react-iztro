import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import FunctionalAstrolabe from "iztro/lib/astro/FunctionalAstrolabe";
import { Item, ItemProps } from "./Item";
import "./IzpalaceCenter.css";
import { Line } from "./Line";
import { fixEarthlyBranchIndex } from "iztro/lib/utils";
import { Scope } from "iztro/lib/data/types";
import { IFunctionalHoroscope } from "iztro/lib/astro/FunctionalHoroscope";
import { normalizeDateStr, solar2lunar } from "lunar-lite";
import { GenderName, kot, t } from "iztro/lib/i18n";
import { CHINESE_TIME } from "iztro/lib/data";
import { astro } from 'iztro';

// 1. 扩展 props 类型，添加 onShowInterpretation 回调
type IzpalaceCenterProps = {
  astrolabe?: FunctionalAstrolabe;
  horoscope?: IFunctionalHoroscope;
  horoscopeDate?: string | Date;
  horoscopeHour?: number;
  arrowIndex?: number;
  arrowScope?: Scope;
  setHoroscopeDate?: React.Dispatch<
    React.SetStateAction<string | Date | undefined>
  >;
  setHoroscopeHour?: React.Dispatch<React.SetStateAction<number | undefined>>;
  centerPalaceAlign?: boolean;
  // 添加回调函数定义
  onShowInterpretation?: (term: string, x: number, y: number) => void;
};

export const IzpalaceCenter = ({
  astrolabe,
  horoscope,
  arrowIndex,
  arrowScope,
  horoscopeDate = new Date(),
  horoscopeHour = 0,
  setHoroscopeDate,
  setHoroscopeHour,
  centerPalaceAlign,
  onShowInterpretation, // 2. 接收回调函数
}: IzpalaceCenterProps) => {
  // 3. 提取 URL 参数解析为独立工具函数
  const getAstrolabeParams = () => {
    const search = window.location.search;
    if (!search) return { birthday: "", birthTime: 0, gender: "male" };

    const searchParams = new URLSearchParams(search);
    const argsStr = searchParams.get("args") || "";
    const argsArray = argsStr.split(";").filter(Boolean);

    const params = argsArray.reduce((acc, item) => {
      const [key, value] = item.split(":");
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    return {
      birthday: params.birthday || "",
      birthTime: params.birthTime ? Number(params.birthTime) : 0,
      gender: params.gender || "male",
    };
  };

  const records: ItemProps[] = useMemo(
    () => [
      { title: "五行局：", content: astrolabe?.fiveElementsClass },
      { title: "年龄(虚岁)：", content: `${horoscope?.age.nominalAge} 岁` },
      { title: "四柱：", content: astrolabe?.chineseDate },
      { title: "阳历：", content: astrolabe?.solarDate },
      { title: "农历：", content: astrolabe?.lunarDate },
      { title: "时辰：", content: `${astrolabe?.time}(${astrolabe?.timeRange})` },
      { title: "生肖：", content: astrolabe?.zodiac },
      { title: "星座：", content: astrolabe?.sign },
      { title: "命主：", content: astrolabe?.soul },
      { title: "身主：", content: astrolabe?.body },
      { title: "命宫：", content: astrolabe?.earthlyBranchOfSoulPalace },
      { title: "身宫：", content: astrolabe?.earthlyBranchOfBodyPalace },
    ],
    [astrolabe, horoscope]
  );

  const horoDate = useMemo(() => {
    const dateStr = horoscopeDate ?? new Date();
    const [year, month, date] = normalizeDateStr(dateStr);
    const dt = new Date(year, month - 1, date);

    return {
      solar: `${year}-${month}-${date}`,
      lunar: solar2lunar(dateStr).toString(true),
      prevDecadalDisabled: dt.setFullYear(dt.getFullYear() - 1),
    };
  }, [horoscopeDate]);
  
  const onHoroscopeButtonClicked = (scope: Scope, value: number) => {
    if (!astrolabe?.solarDate) return true;

    const [year, month, date] = normalizeDateStr(horoscopeDate);
    const dt = new Date(year, month - 1, date);
    const [birthYear, birthMonth, birthDate] = normalizeDateStr(astrolabe.solarDate);
    const birthday = new Date(birthYear, birthMonth - 1, birthDate);
    let hour = horoscopeHour;

    switch (scope) {
      case "hourly":
        hour = horoscopeHour + value;
        if (horoscopeHour + value > 11) {
          dt.setDate(dt.getDate() + 1);
          hour = 0;
        } else if (horoscopeHour + value < 0) {
          dt.setDate(dt.getDate() - 1);
          hour = 11;
        }
        break;
      case "daily":
        dt.setDate(dt.getDate() + value);
        break;
      case "monthly":
        dt.setMonth(dt.getMonth() + value);
        break;
      case "yearly":
      case "decadal":
        dt.setFullYear(dt.getFullYear() + value);
        break;
    }

    if (dt.getTime() >= birthday.getTime()) {
      setHoroscopeDate?.(dt);
      setHoroscopeHour?.(hour);
    }
  };

  const shouldBeDisabled = useCallback(
    (dateStr: string | Date, scope: Scope, value: number) => {
      if (!astrolabe?.solarDate) return true;

      const [year, month, date] = normalizeDateStr(dateStr);
      const dt = new Date(year, month - 1, date);
      const [birthYear, birthMonth, birthDate] = normalizeDateStr(astrolabe.solarDate);
      const birthday = new Date(birthYear, birthMonth - 1, birthDate);

      switch (scope) {
        case "hourly":
          if (horoscopeHour + value > 11) dt.setDate(dt.getDate() + 1);
          else if (horoscopeHour + value < 0) dt.setDate(dt.getDate() - 1);
          break;
        case "daily":
          dt.setDate(dt.getDate() + value);
          break;
        case "monthly":
          dt.setMonth(dt.getMonth() + value);
          break;
        case "yearly":
        case "decadal":
          dt.setFullYear(dt.getFullYear() + value);
          break;
      }

      return dt.getTime() < birthday.getTime();
    },
    [horoscopeHour, astrolabe]
  );

  return (
    <div
      className={classNames("iztro-center-palace", {
        "iztro-center-palace-centralize": centerPalaceAlign,
      })}
    >
      {astrolabe?.earthlyBranchOfSoulPalace && (
        <Line
          scope={arrowScope}
          index={arrowIndex ?? fixEarthlyBranchIndex(astrolabe.earthlyBranchOfSoulPalace)}
        />
      )}
      <h3 className="center-title">
        <span
          className={`gender gender-${kot<GenderName>(astrolabe?.gender ?? "")}`}
        >
          {kot<GenderName>(astrolabe?.gender ?? "") === "male" ? "♂" : "♀"}
        </span>
        <span>基本信息</span>
      </h3>
      <ul className="basic-info">
        {records.map((rec, idx) => (
          <Item key={idx} {...rec} />
        ))}
      </ul>
      <h3 className="center-title">运限信息</h3>
      <ul className="basic-info">
        <Item title="农历：" content={horoDate.lunar} />
        <div
          className={classNames("solar-horoscope", {
            "solar-horoscope-centralize": centerPalaceAlign,
          })}
        >
          <Item title="阳历：" content={horoDate.solar} />
          <span
            className="today"
            onClick={() => setHoroscopeDate?.(new Date())}
          >
            今日
          </span>
          <span
            className="today"
            onClick={(e) => {
              if(!astrolabe) return
               const safeStringify = (obj:any) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    };
              const rst = {
                horoscope:astrolabe.horoscope(horoscopeDate,horoscopeHour)
              };
              e.stopPropagation();
              navigator.clipboard.writeText("astrolabe.palaces是本命盘按顺序排列的宫位。daily.palaceNames是流日盘按顺序排列的宫位。假设i为0-11（闭区间）的一个整数，astrolabe.palaces[i]为X宫，daily.palaceNames[i]为Y宫,则流日盘的Y宫落在本命盘的X宫。大限流年流月流日流时盘同理。又假设j为0-11（闭区间）的一个整数，daily.palaceName[j]为Z宫，则流日盘的Z宫的星曜为daily.stars[j]这个列表里面的星曜，(daily.stars是一个list[list])。大限流年流月流日流时盘的星曜同理。对于四化。本命盘的X宫主星的四化在astrolabe.palaces[i].majorStars[列表索引].mutagen内（当然它可能为空，表示没有四化）。流日盘的四化在daily.mutagen这个数组里，设这个数组的内容依次为S1，S2，S3，S4，（这四个S代表四个星曜）则S1化禄，S2化权，S3化科，S4化忌。也就是说这个数组里的星，依次是化禄星 化权星 化科星 化忌星。astrolabe.palaces 和各个运限盘的 palaceNames 数组都已按照标准的紫微斗数宫位顺序排列完成，顺序已经包含了所有必要的顺行、逆行排列逻辑。现在你需要做的事情是先解析底下那个Json，一定要先看完再进行下一步，你不需要按照紫微斗数的规则进行排盘，你只需要读取json的内容并构建一个盘，然后根据这个盘来回答我接下来的问题。要求客观，不需要考虑我感受\n"+safeStringify(rst).replace(/\n/g, "").replace(/ /g, ""))
              alert("带AI提示词的星盘Json已复制到剪贴板")
            }}
          >
            提问（Json）
          </span>
          <span
            className="today"
            onClick={(e) => {
              if(!astrolabe) return
               const safeStringify = (obj:any) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    };
              const rst = {
                horoscope:astrolabe.horoscope(horoscopeDate,horoscopeHour)
              };
              e.stopPropagation();
              navigator.clipboard.writeText(safeStringify(rst).replace(/\n/g, "").replace(/ /g, ""))
              alert("已把星盘Json复制到剪贴板")
            }}
          >
            导出
          </span>
          <span
  className="today"
  onClick={(e) => {
    if (!astrolabe) return;

    const safeStringify = (obj: any) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    };

    const parseHoroscopeFull = (jsonString: string): string => {
      const data = JSON.parse(jsonString);
      const h = data.horoscope;
      const a = h.astrolabe;
      const palaces = a.palaces;

      const buildMutagenMap = (mutagenList: string[] | undefined): Record<string, string> => {
        if (!mutagenList || mutagenList.length !== 4) return {};
        return {
          [mutagenList[0]]: "禄",
          [mutagenList[1]]: "权",
          [mutagenList[2]]: "科",
          [mutagenList[3]]: "忌",
        };
      };

      const addLimitsSection = (lines: string[], limitDict: any, title: string) => {
        if (!limitDict) return;
        lines.push(`### ${title}`);
        lines.push(`- 干支：${limitDict.heavenlyStem || ""}${limitDict.earthlyBranch || ""}`);
        const mutagen = limitDict.mutagen || [];
        lines.push(`- 四化(禄权科忌)：${mutagen[0] || ""}化禄,${mutagen[1] || ""}化权,${mutagen[2] || ""}化科,${mutagen[3] || ""}化忌`);
        //lines.push(`- 宫位顺序：${(limitDict.palaceNames || []).join(", ")}`);
        lines.push("");
      };

      const get = (obj: any, path: string, def: any = "") => {
        return path.split(".").reduce((o, k) => (o?.[k] !== undefined ? o[k] : def), obj);
      };

      const lines: string[] = [];

      // 基本信息
      lines.push("# 信息");
      lines.push(`性别：${a.gender || ""}`);
      lines.push(`年龄(虚岁)：${get(h, "age.nominalAge", "")}`);
      lines.push(`阳历：${a.solarDate || ""} / ${h.solarDate || ""}(盘中当前)`);
      lines.push(`农历：${a.lunarDate || ""} / ${h.lunarDate || ""}(盘中当前)`);
      lines.push(`时辰：${a.time || ""}(${a.timeRange || ""})`);
      lines.push(`五行局：${a.fiveElementsClass || ""}`);
      lines.push(`四柱：${a.chineseDate || ""}`);
      lines.push(`生肖：${a.zodiac || ""}`);
      lines.push(`星座：${a.sign || ""}`);
      lines.push(`命主：${a.soul || ""}(地支${a.earthlyBranchOfSoulPalace || ""})`);
      lines.push(`身主：${a.body || ""}(地支${a.earthlyBranchOfBodyPalace || ""})`);

      const lifePalace = palaces.find((p: any) => p.name === "命宫");
      lines.push(`命宫：${lifePalace?.earthlyBranch || ""}`);
      const bodyPalace = palaces.find((p: any) => p.isBodyPalace === true);
      lines.push(`身宫：${bodyPalace?.name || ""}`);

      const raw = a.rawDates || {};
      const rawLunar = raw.lunarDate || {};
      const rawChinese = raw.chineseDate || {};
      lines.push(`原始农历数字：${rawLunar.lunarYear || ""}年${rawLunar.lunarMonth || ""}月${rawLunar.lunarDay || ""}日 闰${rawLunar.isLeap || false}`);
      const yearlyCn = rawChinese.yearly || ["", ""];
      const monthlyCn = rawChinese.monthly || ["", ""];
      const dailyCn = rawChinese.daily || ["", ""];
      const hourlyCn = rawChinese.hourly || ["", ""];
      lines.push(`原始四柱干支：年${yearlyCn[0]}${yearlyCn[1]} 月${monthlyCn[0]}${monthlyCn[1]} 日${dailyCn[0]}${dailyCn[1]} 时${hourlyCn[0]}${hourlyCn[1]}`);
      lines.push("");

      // 运限信息
      lines.push("# 运限信息");
      lines.push(`当前农历：${h.lunarDate || ""}`);
      lines.push(`当前阳历：${h.solarDate || ""}`);
      lines.push("");

      addLimitsSection(lines, h.decadal, "大限 (decadal)");
      addLimitsSection(lines, h.age, "小限 (age)");
      addLimitsSection(lines, h.yearly, "流年 (yearly)");

      //lines.push("#### 流年额外星曜(岁前十二星 / 将前十二星)");
      const yds = h.yearly?.yearlyDecStar || {};
      //lines.push(`- 岁前十二星(顺序)：${(yds.suiqian12 || []).join(", ")}`);
      //lines.push(`- 将前十二星(顺序)：${(yds.jiangqian12 || []).join(", ")}`);
      lines.push("");

      addLimitsSection(lines, h.monthly, "流月 (monthly)");
      addLimitsSection(lines, h.daily, "流日 (daily)");
      addLimitsSection(lines, h.hourly, "流时 (hourly)");
      lines.push("");

      // 十二宫
      lines.push("# 宫位");

      const decadalMut = buildMutagenMap(h.decadal?.mutagen);
      const ageMut = buildMutagenMap(h.age?.mutagen);
      const yearlyMut = buildMutagenMap(h.yearly?.mutagen);
      const monthlyMut = buildMutagenMap(h.monthly?.mutagen);
      const dailyMut = buildMutagenMap(h.daily?.mutagen);
      const hourlyMut = buildMutagenMap(h.hourly?.mutagen);

      const decadalStars: any[][] = h.decadal?.stars || [];
      const yearlyStars: any[][] = h.yearly?.stars || [];
      const monthlyStars: any[][] = h.monthly?.stars || [];
      const dailyStars: any[][] = h.daily?.stars || [];
      const hourlyStars: any[][] = h.hourly?.stars || [];

      // 提前获取各运限的 palaceNames 数组，避免重复访问
      const decadalPalNames = h.decadal?.palaceNames || [];
      const agePalNames = h.age?.palaceNames || [];
      const yearlyPalNames = h.yearly?.palaceNames || [];
      const monthlyPalNames = h.monthly?.palaceNames || [];
      const dailyPalNames = h.daily?.palaceNames || [];
      const hourlyPalNames = h.hourly?.palaceNames || [];

      for (let idx = 0; idx < palaces.length; idx++) {
        const palace = palaces[idx];
        const title = palace.name.endsWith("宫") ? palace.name : palace.name + "宫";
        lines.push(`## 本命盘：${title}`);

        lines.push(`- 宫位干支：${palace.heavenlyStem || ""}${palace.earthlyBranch || ""}`);
        lines.push(`- 身宫：${palace.isBodyPalace ? "是" : "否"}  原局命宫：${palace.isOriginalPalace ? "是" : "否"}`);
        const decRange = palace.decadal?.range || [];
        lines.push(`- 大限年龄范围：${decRange[0] || ""}-${decRange[1] || ""}岁 (大限干支${palace.decadal?.heavenlyStem || ""}${palace.decadal?.earthlyBranch || ""})`);
        lines.push(`- 各小限年龄列表：${(palace.ages || []).join(", ")}`);

        // 修正：直接通过数组索引访问，不再使用 get
       function ensureGong(name:string) {
    if (!name) return null;
    return name.endsWith('宫') ? name : name + '宫';
}


        const majorStars = palace.majorStars || [];
        if (majorStars.length) {
          lines.push("主星：");
          for (const ms of majorStars) {
            const star = ms.name;
            const brightness = ms.brightness || "";
            const originMutagen = ms.mutagen || "";
            lines.push(`  - ${star}(${brightness})；本命四化：${originMutagen || "无"}；四化(大限:${decadalMut[star] || "无"}, 小限:${ageMut[star] || "无"}, 流年:${yearlyMut[star] || "无"}, 流月:${monthlyMut[star] || "无"}, 流日:${dailyMut[star] || "无"}, 流时:${hourlyMut[star] || "无"})`);
          }
        } else {
          lines.push("主星：无");
        }

        lines.push(`辅星：${(palace.minorStars || []).map((s: any) => s.name).join(", ") || "无"}`);
        lines.push(`杂曜：${(palace.adjectiveStars || []).map((s: any) => s.name).join(", ") || "无"}`);

        // 安全获取各运限当前索引的星曜列表
        const decFlowStars = decadalStars[idx] || [];
        const yearFlowStars = yearlyStars[idx] || [];
        const monthFlowStars = monthlyStars[idx] || [];
        const dayFlowStars = dailyStars[idx] || [];
        const hourFlowStars = hourlyStars[idx] || [];

        lines.push("流曜和落宫：");
        const deca = ensureGong(decadalPalNames[idx]);
if (deca) lines.push(`- 大限${deca}落于此`);
lines.push(`  - 大限流曜：${decFlowStars.map((s: any) => s.name).join("、") || "无"}`);
const age = ensureGong(agePalNames[idx]);
if (age) lines.push(`- 小限${age}落于此`);

const yearly = ensureGong(yearlyPalNames[idx]);
if (yearly) lines.push(`- 流年${yearly}落于此`);
lines.push(`  - 流年流曜：${yearFlowStars.map((s: any) => s.name).join("、") || "无"}`);
const monthly = ensureGong(monthlyPalNames[idx]);
if (monthly) lines.push(`- 流月${monthly}落于此`);
lines.push(`  - 流月流曜：${monthFlowStars.map((s: any) => s.name).join("、") || "无"}`);
const daily = ensureGong(dailyPalNames[idx]);
if (daily) lines.push(`- 流日${daily}落于此`);
lines.push(`  - 流日流曜：${dayFlowStars.map((s: any) => s.name).join("、") || "无"}`);
const hourly = ensureGong(hourlyPalNames[idx]);
if (hourly) lines.push(`- 流时${hourly}落于此`);
lines.push(`  - 流时流曜：${hourFlowStars.map((s: any) => s.name).join("、") || "无"}`);
        
        
        
        

        lines.push(`十二长生：${palace.changsheng12 || ""}`);
        lines.push(`十二博士：${palace.boshi12 || ""}`);
        lines.push(`将前十二：${palace.jiangqian12 || ""}`);
        lines.push(`岁前十二：${palace.suiqian12 || ""}`);
        lines.push("");
      }

      return lines.join("\n");
    };

    const rst = {
      horoscope: astrolabe.horoscope(horoscopeDate, horoscopeHour),
    };

    const jsonString = safeStringify(rst).replace(/\n/g, "").replace(/ /g, "");
    const markdownReport = parseHoroscopeFull(jsonString);

    e.stopPropagation();
    navigator.clipboard.writeText(markdownReport+"以上为命盘。请参照此盘回答用户的问题，需要客观，无需考虑用户是否乐意听。用户提问：");
    alert("星盘解析（Markdown格式）已复制到剪贴板");
  }}
>
  提问
</span>
        </div>
      </ul>
      <div className="horo-buttons">
        {/* 运限按钮组保持不变 */}
        <span
          className={classNames("center-button", {
            disabled: shouldBeDisabled(horoDate.solar, "yearly", -10),
          })}
          onClick={() => onHoroscopeButtonClicked("yearly", -10)}
        >
          ◀限
        </span>
        <span
          className={classNames("center-button", {
            disabled: shouldBeDisabled(horoDate.solar, "yearly", -1),
          })}
          onClick={() => onHoroscopeButtonClicked("yearly", -1)}
        >
          ◀年
        </span>
        <span
          className={classNames("center-button", {
            disabled: shouldBeDisabled(horoDate.solar, "monthly", -1),
          })}
          onClick={() => onHoroscopeButtonClicked("monthly", -1)}
        >
          ◀月
        </span>
        <span
          className={classNames("center-button", {
            disabled: shouldBeDisabled(horoDate.solar, "daily", -1),
          })}
          onClick={() => onHoroscopeButtonClicked("daily", -1)}
        >
          ◀日
        </span>
        <span
          className={classNames("center-button", {
            disabled: shouldBeDisabled(horoDate.solar, "hourly", -1),
          })}
          onClick={() => onHoroscopeButtonClicked("hourly", -1)}
        >
          ◀时
        </span>
        <span className="center-horo-hour">
          {t(CHINESE_TIME[horoscopeHour])}
        </span>
        <span
          className={classNames("center-button")}
          onClick={() => onHoroscopeButtonClicked("hourly", 1)}
        >
          时▶
        </span>
        <span
          className={classNames("center-button")}
          onClick={() => onHoroscopeButtonClicked("daily", 1)}
        >
          日▶
        </span>
        <span
          className={classNames("center-button")}
          onClick={() => onHoroscopeButtonClicked("monthly", 1)}
        >
          月▶
        </span>
        <span
          className={classNames("center-button")}
          onClick={() => onHoroscopeButtonClicked("yearly", 1)}
        >
          年▶
        </span>
        <span
          className={classNames("center-button")}
          onClick={() => onHoroscopeButtonClicked("yearly", 10)}
        >
          限▶
        </span>
      </div>
      <a
        className="iztro-copyright"
        href="https://github.com/sylarlong/iztro"
        target="_blank"
      >
        <i>Powered by <code>iztro</code></i>
      </a>
    </div>
  );
};