// src/Izpalace/Izpalace.tsx
import React, { useMemo } from "react";
import classNames from "classnames";
import { Izstar } from "../Izstar/Izstar";
import { fixIndex } from "iztro/lib/utils";
import { kot, t } from "iztro/lib/i18n";
import { HoroscopeForPalace, IzpalaceProps } from "./Izpalace.type";
import { Scope } from "iztro/lib/data/types";
import "./Izpalace.css";

export interface IzpalaceProps {
  index: number;
  taichiPalace?: string;
  focusedIndex?: number;
  onFocused?: (index: number | undefined) => void;
  horoscope?: any;
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
  majorStars: any[];
  minorStars: any[];
  adjectiveStars: any[];
  name: string;
  isBodyPalace?: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  changsheng12: string;
  boshi12: string;
  suiqian12: string;
  jiangqian12: string;
  ages: string[];
  decadal: {
    range: string[];
  };
  [key: string]: any;
  onShowInterpretation: (term: string, x: number, y: number) => void;
}

export const Izpalace = ({
  index,
  taichiPalace,
  focusedIndex,
  onFocused,
  horoscope,
  activeHeavenlyStem,
  toggleActiveHeavenlyStem,
  hoverHeavenlyStem,
  setHoverHeavenlyStem,
  showDecadalScope = false,
  showYearlyScope = false,
  showMonthlyScope = false,
  showDailyScope = false,
  showHourlyScope = false,
  toggleScope,
  toggleTaichiPoint,
  onShowInterpretation,
  ...palace
}: IzpalaceProps) => {
  const horoscopeNames = useMemo<HoroscopeForPalace[]>(() => {
    const horoscopeNames = [];

    if (horoscope?.decadal.index === index) {
      horoscopeNames.push({
        ...horoscope.decadal,
        scope: "decadal" as Scope,
        show: showDecadalScope,
      });
    }

    if (horoscope?.yearly.index === index) {
      horoscopeNames.push({
        ...horoscope.yearly,
        scope: "yearly" as Scope,
        show: showYearlyScope,
      });
    }

    if (horoscope?.monthly.index === index) {
      horoscopeNames.push({
        ...horoscope.monthly,
        scope: "monthly" as Scope,
        show: showMonthlyScope,
      });
    }

    if (horoscope?.daily.index === index) {
      horoscopeNames.push({
        ...horoscope.daily,
        scope: "daily" as Scope,
        show: showDailyScope,
      });
    }

    if (horoscope?.hourly.index === index) {
      horoscopeNames.push({
        ...horoscope.hourly,
        scope: "hourly" as Scope,
        show: showHourlyScope,
      });
    }

    if (horoscope?.age.index === index) {
      horoscopeNames.push({
        name: horoscope.age.name,
        heavenlyStem: undefined,
        scope: "age" as Scope,
        show: false,
      });
    }

    return horoscopeNames;
  }, [
    horoscope,
    showDecadalScope,
    showYearlyScope,
    showMonthlyScope,
    showDailyScope,
    showHourlyScope,
  ]);

  const horoscopeMutagens = useMemo(() => {
    if (!horoscope) {
      return [];
    }

    return [
      {
        mutagen: horoscope.decadal.mutagen,
        scope: "decadal" as Scope,
        show: showDecadalScope,
      },
      {
        mutagen: horoscope.yearly.mutagen,
        scope: "yearly" as Scope,
        show: showYearlyScope,
      },
      {
        mutagen: horoscope.monthly.mutagen,
        scope: "monthly" as Scope,
        show: showMonthlyScope,
      },
      {
        mutagen: horoscope.daily.mutagen,
        scope: "daily" as Scope,
        show: showDailyScope,
      },
      {
        mutagen: horoscope.hourly.mutagen,
        scope: "hourly" as Scope,
        show: showHourlyScope,
      },
    ];
  }, [
    horoscope,
    showDecadalScope,
    showYearlyScope,
    showMonthlyScope,
    showDailyScope,
    showHourlyScope,
  ]);

  const handleClick = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    onShowInterpretation(term, e.clientX, e.clientY);
  };

  return (
    <div
      className={classNames("iztro-palace", {
        "focused-palace": focusedIndex === index,
        "opposite-palace":
          focusedIndex != undefined && index === fixIndex(focusedIndex + 6),
        "surrounded-palace":
          focusedIndex != undefined &&
          (index === fixIndex(focusedIndex + 4) ||
            index === fixIndex(focusedIndex - 4)),
      })}
      style={{ gridArea: `g${index}` }}
      onMouseEnter={() => onFocused?.(index)}
      onMouseLeave={() => onFocused?.(undefined)}
    >
      <div className={classNames("iztro-palace-major")}>
        {palace.majorStars.map((star: any) => (
          <Izstar
            key={star.name}
            activeHeavenlyStem={activeHeavenlyStem}
            hoverHeavenlyStem={hoverHeavenlyStem}
            palaceHeavenlyStem={kot<HeavenlyStemKey>(
              palace.heavenlyStem,
              "Heavenly"
            )}
            horoscopeMutagens={horoscopeMutagens}
            onShowInterpretation={onShowInterpretation}
            {...star}
          />
        ))}
      </div>
      <div className={classNames("iztro-palace-minor")}>
        {palace.minorStars.map((star: any) => (
          <Izstar
            key={star.name}
            activeHeavenlyStem={activeHeavenlyStem}
            hoverHeavenlyStem={hoverHeavenlyStem}
            palaceHeavenlyStem={kot<HeavenlyStemKey>(
              palace.heavenlyStem,
              "Heavenly"
            )}
            horoscopeMutagens={horoscopeMutagens}
            onShowInterpretation={onShowInterpretation}
            {...star}
          />
        ))}
      </div>
      <div className={classNames("iztro-palace-adj")}>
        <div>
          {palace.adjectiveStars.slice(5).map((star: any) => (
            <Izstar 
              key={star.name} 
              {...star} 
              onShowInterpretation={onShowInterpretation}
            />
          ))}
        </div>
        <div>
          {palace.adjectiveStars.slice(0, 5).map((star: any) => (
            <Izstar 
              key={star.name} 
              {...star} 
              onShowInterpretation={onShowInterpretation}
            />
          ))}
        </div>
      </div>
      <div className={classNames("iztro-palace-horo-star")}>
        <div className={classNames("stars")}>
          {horoscope?.decadal?.stars &&
            horoscope?.decadal?.stars[index].map((star: any) => (
              <Izstar 
                key={star.name} 
                {...star} 
                onShowInterpretation={onShowInterpretation}
              />
            ))}
        </div>
        <div className={classNames("stars")}>
          {horoscope?.yearly?.stars &&
            horoscope?.yearly?.stars[index].map((star: any) => (
              <Izstar 
                key={star.name} 
                {...star} 
                onShowInterpretation={onShowInterpretation}
              />
            ))}
        </div>
        <div className={classNames("stars")}>
        {showMonthlyScope && (horoscope?.monthly?.stars &&
            horoscope?.monthly?.stars[index].map((star: any) => (
              <Izstar 
                key={star.name} 
                {...star} 
                onShowInterpretation={onShowInterpretation}
              />
            )))}
        </div>
        <div className={classNames("stars")}>
          {showDailyScope && (horoscope?.daily?.stars &&
            horoscope?.daily?.stars[index].map((star: any) => (
              <Izstar 
                key={star.name} 
                {...star} 
                onShowInterpretation={onShowInterpretation}
              />
            )))}
        </div>
        <div className={classNames("stars")}>
        {showHourlyScope && (horoscope?.hourly?.stars &&
            horoscope?.hourly?.stars[index].map((star: any) => (
              <Izstar 
                key={star.name} 
                {...star} 
                onShowInterpretation={onShowInterpretation}
              />
            )))}
        </div>
      </div>
      <div className={classNames("iztro-palace-fate")}>
        {horoscopeNames?.map((item) => (
          <span
            key={item.name}
            className={classNames({
              [`iztro-palace-${item.scope}-active`]: item.show,
            })}
            onClick={
              item.scope ? () => toggleScope?.(item.scope as Scope) : undefined
            }
          >
            {item.name}
            {item.heavenlyStem && `·${item.heavenlyStem}`}
          </span>
        ))}
      </div>
      <div className={classNames("iztro-palace-footer")}>
        <div>
          <div className={classNames("iztro-palace-lft24")}>
            <div onClick={(e) => handleClick(e, palace.changsheng12)}>
              {palace.changsheng12}
            </div>
            <div onClick={(e) => handleClick(e, palace.boshi12)}>
              {palace.boshi12}
            </div>
          </div>
          <div
            className={classNames("iztro-palace-name")}
            onClick={(e) => {
              toggleTaichiPoint?.(index);
            }}
          >
            <span className="iztro-palace-name-wrapper">
              {palace.name}
              <span className="iztro-palace-name-taichi">
                {taichiPalace &&
                  (kot<PalaceKey>(taichiPalace) === kot<PalaceKey>("命宫")
                    ? "☯"
                    : taichiPalace)}
              </span>
            </span>
            {palace.isBodyPalace && (
              <span 
                className={classNames("iztro-palace-name-body")}
                onClick={(e) => handleClick(e, t("bodyPalace"))}
              >
                ·{t("bodyPalace")}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className={classNames("iztro-palace-scope")}>
            <div 
              className={classNames("iztro-palace-scope-age")}
              onClick={(e) => handleClick(e, palace.ages.join(" "))}
            >
              {palace.ages.slice(0, 7).join(" ")}
            </div>
            <div 
              className={classNames("iztro-palace-scope-decadal")}
              onClick={(e) => handleClick(e, palace.decadal.range.join(" - "))}
            >
              {palace.decadal.range.join(" - ")}
            </div>
          </div>
          <div className={classNames("iztro-palace-dynamic-name")}>
            {showDecadalScope && (
              <span 
                className="iztro-palace-dynamic-name-decadal"
                onClick={(e) => handleClick(e, horoscope?.decadal.palaceNames[index])}
              >
                {horoscope?.decadal.palaceNames[index]}
              </span>
            )}
            {showYearlyScope && (
              <span 
                className="iztro-palace-dynamic-name-yearly"
                onClick={(e) => handleClick(e, horoscope?.yearly.palaceNames[index])}
              >
                {horoscope?.yearly.palaceNames[index]}
              </span>
            )}
            {showMonthlyScope && (
              <span 
                className="iztro-palace-dynamic-name-monthly"
                onClick={(e) => handleClick(e, horoscope?.monthly.palaceNames[index])}
              >
                {horoscope?.monthly.palaceNames[index]}
              </span>
            )}
            {showDailyScope && (
              <span 
                className="iztro-palace-dynamic-name-daily"
                onClick={(e) => handleClick(e, horoscope?.daily.palaceNames[index])}
              >
                {horoscope?.daily.palaceNames[index]}
              </span>
            )}
            {showHourlyScope && (
              <span 
                className="iztro-palace-dynamic-name-hourly"
                onClick={(e) => handleClick(e, horoscope?.hourly.palaceNames[index])}
              >
                {horoscope?.hourly.palaceNames[index]}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className={classNames("iztro-palace-rgt24")}>
            <div onClick={(e) => handleClick(e, 
              showYearlyScope
                ? horoscope?.yearly.yearlyDecStar.suiqian12[index]
                : palace.suiqian12
            )}>
              {showYearlyScope
                ? horoscope?.yearly.yearlyDecStar.suiqian12[index]
                : palace.suiqian12}
            </div>
            <div onClick={(e) => handleClick(e,
              showYearlyScope
                ? horoscope?.yearly.yearlyDecStar.jiangqian12[index]
                : palace.jiangqian12
            )}>
              {showYearlyScope
                ? horoscope?.yearly.yearlyDecStar.jiangqian12[index]
                : palace.jiangqian12}
            </div>
          </div>

          <div
            className={classNames("iztro-palace-gz", {
              "iztro-palace-gz-active":
                activeHeavenlyStem ===
                kot<HeavenlyStemKey>(palace.heavenlyStem, "Heavenly"),
            })}
            onClick={(e) => {
              handleClick(e, palace.heavenlyStem + palace.earthlyBranch);
              toggleActiveHeavenlyStem?.(
                kot<HeavenlyStemKey>(palace.heavenlyStem, "Heavenly")
              );
            }}
            onMouseEnter={() =>
              setHoverHeavenlyStem?.(
                kot<HeavenlyStemKey>(palace.heavenlyStem, "Heavenly")
              )
            }
            onMouseLeave={() => setHoverHeavenlyStem?.(undefined)}
          >
            <span
              className={classNames({
                "iztro-palace-gz-active":
                  activeHeavenlyStem ===
                  kot<HeavenlyStemKey>(palace.heavenlyStem, "Heavenly"),
              })}
            >
              {palace.heavenlyStem}
              {palace.earthlyBranch}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};