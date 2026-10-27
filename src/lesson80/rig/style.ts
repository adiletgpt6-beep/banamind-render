// Необязательные уточнения рисунка рига для отдельных фильмов. По умолчанию
// (пустой стиль) персонажи рисуются как в прежних фильмах серии.
// refined — румянец обрезан контуром лица, полутень дальней стороны лица
// мягкая (без шва), тень подбородка не выходит за края шеи.
import { createContext, useContext } from "react";

export type RigStyle = { readonly refined?: boolean };
export const RigStyleContext = createContext<RigStyle>({});
export const useRigStyle = () => useContext(RigStyleContext);
