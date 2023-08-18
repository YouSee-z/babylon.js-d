import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  AmmoJSPlugin,
  SceneLoader,
  DirectionalLight,
  FreeCamera,
  Vector3,
} from "@babylonjs/core";
import { AirportScene } from "./sence/AirportScene";
// import { Ammo } from "../../interface/ammo";
import * as Ammo from "interface/ammo.d.ts";
console.log(Ammo)

export class Game {
  private engine: Engine;
  private scene: Scene;

  // 机场
  private airportScene: AirportScene | undefined;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas);
    this.scene = this.CreateScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  CreateScene() {
    const scene = new Scene(this.engine);
    scene.enablePhysics(
      new Vector3(0, -10, 0),
      new AmmoJSPlugin(true, Ammo)
    );
    // 相机
    const camera = new FreeCamera("FreeCamera", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);

    const dir = new Vector3(0.3, -1, 0.3);
    let light = new DirectionalLight("DirectionalLight", dir, scene);

    //创建机场
     this.airportScene = new AirportScene(scene, this.engine);
    this.airportScene.init();
    //

    console.log(
      "this.airportScene.flyPositions",
      this.airportScene.flyPositions,
      // this.airportScene.flyPositions[0].absoluteRotationQuaternion
    );

    return scene;
  }
}
