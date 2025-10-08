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
            今
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
            问
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
            导
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