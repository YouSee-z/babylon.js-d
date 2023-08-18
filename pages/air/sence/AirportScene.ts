// import * as BABYLON from "@babylonjs/core";
import "babylonjs-materials";
import { AmmoJSPlugin } from "@babylonjs/core";
import { url } from "@config/index";
import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  Engine,
  Mesh,
  MeshBuilder,
  Texture,
  Scene,
  StandardMaterial,
  PhysicsImpostor,
  AbstractMesh,
  AssetContainer,
  GlowLayer,
  Observer,
  Nullable,
  SceneLoader,
  ISceneLoaderPlugin,
} from "@babylonjs/core";
import { GLTFFileLoader, OBJFileLoader } from "babylonjs-loaders";
import { loadSceneLoader } from "../common/loader";

// import /assets/texture/skybox6.png
// import skybox6 from "../../../assets/texture/skybox6.png";
// console.log(skybox6, "skybox6");

/**
 * 飞机场地图
 */
export class AirportScene {
  private scene;
  private _engine: Engine;
  private assetContainer!: AssetContainer;

  private waterMesh!: AbstractMesh;
  private groundList = [];

  private skySphere!: Mesh;
  private gl!: GlowLayer;
  private beforeRender!: Nullable<Observer<Scene>>;

  constructor(scene: Scene, _engine: Engine) {
    this.scene = scene;
    this._engine = _engine;
  }

  public flyPositions: any[] = [];

  async init() {
    this.addEvent();
    this.createSkyBox(this.scene);

    this.assetContainer = await this.loadMap(this.scene);
    this.assetContainer.addAllToScene();
    console.log(this.assetContainer);

    for (let mesh of this.assetContainer.meshes) {
      if (mesh.name.indexOf("flymesh") != -1) {
        // @ts-ignore
        this.flyPositions[mesh.name.split("_")[1]] = mesh;
        mesh.parent = null;
        mesh.setEnabled(false);
      }
    }

    for (let mesh of this.assetContainer.meshes) {
      if (mesh.name.indexOf("water") != -1) {
        this.waterMesh = mesh;
      }

      if (
        mesh.name.indexOf("_phusics") != -1 ||
        mesh.name.indexOf("root") != -1
      ) {
        mesh.physicsImpostor = new PhysicsImpostor(
          mesh,
          BABYLON.PhysicsImpostor.MeshImpostor,
          { mass: 0 }
        );
      }
    }
  }

  private loadMap(scene: Scene): any {
    return new Promise((success) => {
      // 预先加载loader
      const SceneLoader = loadSceneLoader();
      SceneLoader.LoadAssetContainer(
        "./assets/mesh/map/",
        "mapglb.glb",
        scene,
        function (container) {
          success(container);
          // container.addAllToScene();
        }
      );
    });
  }

  private createSkyBox(scene: Scene) {
    let skyBoxMaterial = new StandardMaterial("skyBox", scene);
    skyBoxMaterial.backFaceCulling = false;
    skyBoxMaterial.diffuseTexture = new Texture(
      url + "./assets/texture/skybox6.png",
      scene
    );
    skyBoxMaterial.emissiveTexture = new Texture(
      url + "./assets/texture/skybox6.png",
      scene
    );
    skyBoxMaterial.specularColor = new Color3(0, 0, 0);
    skyBoxMaterial.emissiveColor = new Color3(0, 0, 0);
    skyBoxMaterial.disableLighting = true;

    /**
     * 天空球
     */
    this.skySphere = MeshBuilder.CreateSphere(
      "skySphere",
      { diameter: 15000 },
      scene
    );
    this.skySphere.rotation.x = Math.PI;
    this.skySphere.position.y = 100;
    this.skySphere.scaling.y = 0.5;
    this.skySphere.material = skyBoxMaterial;
    this.skySphere.applyFog = false;

    scene.environmentTexture = new CubeTexture(
      url + "./assets/texture/skybox6/skybox6",
      scene
    );
    scene.environmentTexture.level = 1;

    scene.fogMode = Scene.FOGMODE_EXP;
    scene.fogDensity = 0.00005;
    scene.fogColor = new Color3(0.2, 0.2, 0.2);

    this.gl = new GlowLayer("glow", scene);
    this.gl.intensity = 1;
  }

  private addEvent() {
    this.beforeRender = this.scene.onBeforeRenderObservable.add(() => {
      this.render();
    });
  }

  private removeEvent() {
    this.scene.onBeforeRenderObservable.remove(this.beforeRender);
  }

  private render() {
    if (this.waterMesh) {
      // @ts-ignore
      this.waterMesh.material["bumpTexture"].uOffset += 0.001;
    }
  }

  public dispose() {
    this.removeEvent();
    // this.ground.dispose(false, true)
    this.skySphere.dispose(false, true);
    this.assetContainer.removeAllFromScene();
    this.assetContainer.dispose();

    for (let i = 0; i < this.assetContainer.meshes.length; i++) {
      this.assetContainer.meshes[i].dispose(false, true);
    }

    this.gl.dispose();
    for (let i = 0; i < this.groundList.length; i++) {
      // @ts-ignore
      this.groundList[i].dispose(false, true);
    }
    this.groundList = [];

    this.scene.environmentTexture = null;
  }
}
