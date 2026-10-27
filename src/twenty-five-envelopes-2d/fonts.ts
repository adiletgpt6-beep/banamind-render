import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { F } from "./theme";

// Статические начертания, собранные из OFL-шрифтов (латиница + кириллица +
// расширенная кириллица в одном файле): public/fonts/OFL-*.txt.
loadFont({ family: F.display, url: staticFile("fonts/InterTight-Black.ttf"), weight: "900", format: "truetype" });
loadFont({ family: F.text, url: staticFile("fonts/Onest-Medium.ttf"), weight: "500", format: "truetype" });
loadFont({ family: F.text, url: staticFile("fonts/Onest-ExtraBold.ttf"), weight: "800", format: "truetype" });
// Рукописный почерк записок и имён на конвертах: Caveat (OFL,
// public/fonts/OFL-Caveat.txt) — есть Ү ү, Ө ө, Ң ң.
loadFont({ family: F.hand, url: staticFile("fonts/Caveat-Variable.ttf"), weight: "400 700", format: "truetype" });
