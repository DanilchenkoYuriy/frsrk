import { describe, expect, it } from "vitest";
import mapData from "@/data/crimea-map.json";
import { MUNICIPALITIES } from "../scripts/seed-data";

describe("карта Крыма", () => {
  it("содержит 25 муниципальных образований Крыма и Севастополь, коды совпадают со справочником", () => {
    const onMap = Object.keys(mapData.regions).sort();
    const listed = MUNICIPALITIES.map((m) => m.slug).sort();
    expect(listed).toHaveLength(26);
    expect(onMap).toEqual(listed);
  });
  it("11 городских округов, 14 районов и город федерального значения Севастополь", () => {
    expect(MUNICIPALITIES.filter((m) => m.kind === "federal-city").map((m) => m.slug)).toEqual(["sevastopol"]);
    expect(MUNICIPALITIES.filter((m) => m.kind === "city")).toHaveLength(11);
    expect(MUNICIPALITIES.filter((m) => m.kind === "district")).toHaveLength(14);
  });
});
