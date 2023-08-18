import { GLTFFileLoader, OBJFileLoader } from "babylonjs-loaders";
import { SceneLoader, ISceneLoaderPlugin } from "@babylonjs/core";

export function loadSceneLoader() {
  SceneLoader.RegisterPlugin(
    new GLTFFileLoader() as unknown as ISceneLoaderPlugin
  );
  SceneLoader.RegisterPlugin(
    new OBJFileLoader() as unknown as ISceneLoaderPlugin
  );
  return SceneLoader;
}
