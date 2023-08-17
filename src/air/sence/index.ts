import * as BABYLON from "@babylonjs/core";
import "babylonjs-materials";
import { AmmoJSPlugin } from "@babylonjs/core";
import { url } from "@config/index";
console.log(url, "url----------------");
//  import { meshList } from '../base/test2';

/**
 * 飞机场地图
 */
export class AirportScene {
  private scene;
  private _engine;
  private assetContainer!: BABYLON.AssetContainer;

  private waterMesh!: BABYLON.AbstractMesh;
  private groundList = [];

  private skySphere!: BABYLON.Mesh;
  private gl!: BABYLON.GlowLayer;
  private beforeRender!: BABYLON.Nullable<BABYLON.Observer<BABYLON.Scene>>;

  constructor(scene: BABYLON.Scene, _engine: BABYLON.Engine) {
    this.scene = scene;
    this._engine = _engine;
  }

  public flyPositions = [];

  async init() {
    this.addEvent();
    this.createSkybox(this.scene);

    this.assetContainer = await this.loadMap(this.scene);
    this.assetContainer.addAllToScene();

    for (let mesh of this.assetContainer.meshes) {
      if (mesh.name.indexOf("flymesh") != -1) {
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
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
          mesh,
          BABYLON.PhysicsImpostor.MeshImpostor,
          { mass: 0 }
        );
      }
    }
  }

  private loadMap(scene: BABYLON.Scene): any {
    return new Promise((success) => {
      BABYLON.SceneLoader.LoadAssetContainer(
        url + "assets/mesh/map/",
        "map.glb",
        scene,
        async (container) => {
          success(container);
        }
      );
    });
  }

  private createSkybox(scene: BABYLON.Scene) {
    let skyBoxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyBoxMaterial.backFaceCulling = false;
    skyBoxMaterial.diffuseTexture = new BABYLON.Texture(
      url + "assets/texture/skybox6.png",
      scene
    );
    skyBoxMaterial.emissiveTexture = new BABYLON.Texture(
      url + "assets/texture/skybox6.png",
      scene
    );
    skyBoxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.disableLighting = true;

    /**
     * 天空球
     */
    this.skySphere = BABYLON.MeshBuilder.CreateSphere(
      "skySphere",
      { diameter: 15000 },
      scene
    );
    this.skySphere.rotation.x = Math.PI;
    this.skySphere.position.y = 100;
    this.skySphere.scaling.y = 0.5;
    this.skySphere.material = skyboxMaterial;
    this.skySphere.applyFog = false;

    scene.environmentTexture = new BABYLON.CubeTexture(
      url + "assets/texture/skybox6/skybox6",
      scene
    );
    scene.environmentTexture.level = 1;

    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.00005;
    scene.fogColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    this.gl = new BABYLON.GlowLayer("glow", scene);
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
      this.groundList[i].dispose(false, true);
    }
    this.groundList = [];

    this.scene.environmentTexture = null;
  }
}
