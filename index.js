// v2

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Céu azul
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles FPS
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Habilitar o PointerLock ao clicar na tela
document.body.addEventListener('click', () => controls.lock());

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Criar o "ovo" (personagem principal)
const eggGeometry = new THREE.SphereGeometry(0.5, 16, 16);
eggGeometry.scale(1, 1.3, 1);
const eggMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const player = new THREE.Mesh(eggGeometry, eggMaterial);
player.position.set(0, 1, 0);
scene.add(player);

// Criar o chão
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Criar paredes cinza cimento
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const wallGeometry = new THREE.BoxGeometry(20, 5, 0.5);

const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
wall1.position.set(0, 2.5, -10);
scene.add(wall1);

const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
wall2.position.set(0, 2.5, 10);
scene.add(wall2);

const sideWallGeometry = new THREE.BoxGeometry(0.5, 5, 20);

const wall3 = new THREE.Mesh(sideWallGeometry, wallMaterial);
wall3.position.set(-10, 2.5, 0);
scene.add(wall3);

const wall4 = new THREE.Mesh(sideWallGeometry, wallMaterial);
wall4.position.set(10, 2.5, 0);
scene.add(wall4);

// Criar inimigos (cubos vermelhos temporários)
const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const enemies = [];
for (let i = 0; i < 3; i++) {
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 10 - 5, 1, Math.random() * -10);
    scene.add(enemy);
    enemies.push(enemy);
}

// Variáveis de movimentação
let keys = {};
let speed = 0.1;
let isJumping = false;
let velocityY = 0;
let gravity = -0.01;

window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Função para movimentação
function movePlayer() {
    const direction = new THREE.Vector3();

    // Capturar a direção da câmera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Ignorar a componente vertical (não queremos voar)
    cameraDirection.normalize();

    // Calcular a direção do movimento com base nas teclas pressionadas
    if (keys['KeyW']) { // Frente
        direction.add(cameraDirection);
    }
    if (keys['KeyS']) { // Trás
        direction.sub(cameraDirection);
    }
    if (keys['KeyA']) { // Esquerda
        const leftDirection = new THREE.Vector3().crossVectors(
            new THREE.Vector3(0, 1, 0), // Vetor "up"
            cameraDirection
        ).normalize();
        direction.add(leftDirection);
    }
    if (keys['KeyD']) { // Direita
        const rightDirection = new THREE.Vector3().crossVectors(
            cameraDirection,
            new THREE.Vector3(0, 1, 0) // Vetor "up"
        ).normalize();
        direction.add(rightDirection);
    }

    // Normalizar a direção para evitar movimentos mais rápidos na diagonal
    if (direction.length() > 0) {
        direction.normalize();
    }

    // Aplicar a velocidade e mover o jogador
    player.position.addScaledVector(direction, speed);

    // Pulo
    if (keys['Space'] && !isJumping) {
        isJumping = true;
        velocityY = 0.2;
    }

    // Gravidade
    if (isJumping) {
        velocityY += gravity;
        player.position.y += velocityY;
        if (player.position.y <= 1) {
            player.position.y = 1;
            isJumping = false;
        }
    }

    // Atualizar a posição da câmera para seguir o jogador
    camera.position.copy(player.position).add(new THREE.Vector3(0, 1, 0));
}

// Sistema de disparo
const bullets = [];
document.addEventListener('click', () => {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    // Ajuste da posição do tiro
    const offset = new THREE.Vector3();
    camera.getWorldDirection(offset);
    offset.multiplyScalar(1.5); // Afasta o ponto de origem do tiro para frente
    bullet.position.copy(camera.position).add(offset);
    
    bullet.direction = new THREE.Vector3();
    camera.getWorldDirection(bullet.direction);
    
    bullets.push(bullet);
    scene.add(bullet);
});

// Animação de balas e colisão
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.position.addScaledVector(bullet.direction, 0.5);

        enemies.forEach((enemy, eIndex) => {
            if (bullet.position.distanceTo(enemy.position) < 0.6) {
                scene.remove(enemy);
                enemies.splice(eIndex, 1);
                scene.remove(bullet);
                bullets.splice(index, 1);
            }
        });
    });
}

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    updateBullets();
    renderer.render(scene, camera);
}
animate();

// Ajuste de tela ao redimensionar
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Som de tiro
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/gunshot.wav', (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(1.0);
});

// Função para atirar
function shoot() {
    if (sound.isPlaying) sound.stop(); // Evita sobreposição de sons
    sound.play();
}
document.addEventListener('click', shoot);

// 🔹 ADICIONAR MIRA NA TELA 🔹
const crosshair = document.createElement('div');
crosshair.style.position = 'fixed';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.width = '10px';
crosshair.style.height = '10px';
crosshair.style.backgroundColor = 'red';
crosshair.style.borderRadius = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.pointerEvents = 'none'; // Não interfere com cliques
document.body.appendChild(crosshair);
