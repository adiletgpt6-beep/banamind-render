import { createContext, useContext } from "react";
import { buildTimeline, estimateManifest, type Timeline } from "./timeline";

// Монтаж (начала сцен и акценты под речь) доступен всем сценам.
// По умолчанию — оценка по тексту, чтобы сцены работали и отдельно.
const fallback = buildTimeline(estimateManifest());

export const TimelineContext = createContext<Timeline>(fallback);

export const useTimeline = () => useContext(TimelineContext);
