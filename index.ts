import { Renderer } from "./rendering";

export function test() {
  const renderer = new Renderer();

  renderer.initScene();
  renderer.renderLoop();
}

test();
