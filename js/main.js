import { setupScene } from './sceneManager.js';
import { setupPhysicsWorld } from './physicsWorld.js';
import { setupPlayerController } from './playerController.js';

// Inicializa a cena, física e controles
const { scene, camera, renderer, boxMesh } = setupScene();
const { world, playerBody, boxBody } = setupPhysicsWorld();
const { updatePlayerMovement } = setupPlayerController(camera, playerBody);

// Loop de animação
function animate() {
    requestAnimationFrame(animate);

    const delta = 0.05; // Tempo aproximado entre frames (60 FPS)

    // Atualiza a física
    world.step(delta);

    // Atualiza a movimentação do jogador
    updatePlayerMovement(delta);

    // Sincroniza a posição da caixa visual com a caixa física
    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    // Renderiza a cena
    renderer.render(scene, camera);
}

animate();