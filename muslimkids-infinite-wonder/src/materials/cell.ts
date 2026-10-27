// Материалы клеток: полупрозрачное «стекло» с френелем и хлоропласты.
import { Color } from "three";
import { shader } from "./index";
import { chloroFragment, glassFragment, glassVertex } from "../shaders/cell";
import { MODEL_LIGHT } from "../engines/LightingSystem";

export function glass(hex: string, rimHex: string, opacity: number, rimPower = 2.2) {
  return shader({
    vertexShader: glassVertex,
    fragmentShader: glassFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Color(hex) },
      uRim: { value: new Color(rimHex) },
      uOpacity: { value: opacity },
      uRimPower: { value: rimPower },
      uKey: { value: MODEL_LIGHT.key.clone() },
    },
  });
}

export function chloroMaterial() {
  return shader({
    vertexShader: glassVertex,
    fragmentShader: chloroFragment,
    transparent: true,
    uniforms: { uKey: { value: MODEL_LIGHT.key.clone() }, uOpacity: { value: 1 }, uGrana: { value: 0.6 } },
  });
}
