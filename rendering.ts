import { AmbientLight, PerspectiveCamera, Scene, WebGLRenderer } from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

export class Renderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private glftLoader: GLTFLoader;

  private hitTestSource: XRHitTestSource | null = null;
  private hitTestRequested = false;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    // document.body.appendChild(this.renderer.domElement);

    this.glftLoader = new GLTFLoader();
  }

  public initScene() {
    // load AR button
    document.body.appendChild(
      ARButton.createButton(this.renderer, { requiredFeatures: ["hit-test"] })
    );

    //Get xr controller
    const controller = this.renderer.xr.getController(0);
    controller.addEventListener("select", (args) => {
      console.log("select event listener", args);
    });
    this.scene.add(controller);

    //handle window resizing
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const light = new AmbientLight(0x404040, 100); // soft white light
    this.scene.add(light);

    //load model
    this.loadGLTFModel("./models/warhammer_40k_ork_a-pose.glb");
  }

  public renderLoop() {
    console.log("im here");
    this.renderer.setAnimationLoop((ts, frame) => {
      if (frame) {
        const referenceSpace = this.renderer.xr.getReferenceSpace();
        const session = this.renderer.xr.getSession();
        if (!this.hitTestRequested && session) {
          session.requestReferenceSpace("viewer").then((refSpace) => {
            session.requestHitTestSource({ space: refSpace })?.then((src) => {
              this.hitTestSource = src;
            });
          });
        }

        if (this.hitTestSource) {
          const htRes = frame.getHitTestResults(this.hitTestSource)[0];
        }
      }
      this.renderer.render(this.scene, this.camera);
    });
  }

  private loadGLTFModel(url: string) {
    this.glftLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.1, 0.1, 0.1);
        this.scene.add(model);
      },
      undefined,
      (e) => {
        console.log("error:", e);
      }
    );
  }
}
