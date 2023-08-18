import styles from "./style.module.css";
import { useEffect, useRef } from "react";
// import FogScene from "./fog";
import { Game } from "./game";
import React from "react";


export default function Air() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function InitAmmo() {
    await window["Ammo"]();
  }
  useEffect(() => {
    if (canvasRef) {
      // InitAmmo();
      new Game(canvasRef.current as HTMLCanvasElement);
    }
  }, [canvasRef]);

  return (
    <canvas className={styles.main} ref={canvasRef}>
      air
    </canvas>
  );
}
