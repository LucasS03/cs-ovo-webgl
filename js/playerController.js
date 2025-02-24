export function setupPlayerController(camera, playerBody) {
    const inputVelocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const rightDirection = new THREE.Vector3();

    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
    };

    // Variáveis para controle do mouse
    let isMouseLocked = false;
    const mouseSensitivity = 0.002;
    let pitch = 0; // Rotação vertical (eixo X)
    let yaw = 0; // Rotação horizontal (eixo Y)

    // Fator de suavização (lerp) para a câmera
    const lerpFactor = 0.1; // Quanto maior, mais rápido a câmera segue o jogador

    // Captura de teclado
    document.addEventListener('keydown', (event) => {
        if (event.key in keys) keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.key in keys) keys[event.key] = false;
    });

    // Captura de movimento do mouse
    document.addEventListener('mousemove', (event) => {
        if (!isMouseLocked) return;

        const movementX =
            event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY =
            event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // Atualiza a rotação da câmera
        yaw -= movementX * mouseSensitivity;
        pitch -= movementY * mouseSensitivity;

        // Limita a rotação vertical para evitar inversões
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        // Aplica a rotação à câmera
        camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    });

    // Bloqueia o cursor ao clicar na tela
    document.addEventListener('click', () => {
        if (!isMouseLocked) {
            document.body.requestPointerLock();
        }
    });

    // Verifica se o cursor foi bloqueado
    document.addEventListener('pointerlockchange', () => {
        isMouseLocked = document.pointerLockElement === document.body;
    });

    function updatePlayerMovement(delta) {
        inputVelocity.set(0, 0, 0);

        // Obtém a direção da câmera
        camera.getWorldDirection(direction);
        direction.y = 0; // Ignora a componente vertical (eixo Y)
        direction.normalize();

        // Calcula a direção lateral (direita)
        rightDirection.crossVectors(direction, camera.up).normalize();

        // Movimentação para frente e para trás
        if (keys.w) inputVelocity.add(direction.clone().multiplyScalar(10 * delta)); // Para frente
        if (keys.s)
            inputVelocity.add(direction.clone().multiplyScalar(-10 * delta)); // Para trás

        // Movimentação lateral (esquerda e direita)
        if (keys.a)
            inputVelocity.add(rightDirection.clone().multiplyScalar(-10 * delta)); // Esquerda
        if (keys.d)
            inputVelocity.add(rightDirection.clone().multiplyScalar(10 * delta)); // Direita

        // Normaliza o vetor de velocidade para evitar extrapolação na diagonal
        if (inputVelocity.length() > 0) {
            inputVelocity.normalize().multiplyScalar(10 * delta);
        }

        // Aplica a velocidade ao corpo do jogador
        playerBody.velocity.x = inputVelocity.x;
        playerBody.velocity.z = inputVelocity.z;

        // Suaviza o movimento da câmera usando lerp
        const targetPosition = playerBody.position.clone(); // Posição do jogador
        camera.position.lerp(targetPosition, lerpFactor);  // Interpola a posição da câmera

        // Mantém a altura da câmera constante (opcional)
        camera.position.y = 1.6; // Altura da câmera (ajuste conforme necessário)

        // Verifica se o jogador ultrapassou o chão
        if (playerBody.position.y < -10) {
            // Se o jogador cair abaixo de -10 no eixo Y, ele continua caindo
            playerBody.velocity.y = -5; // Aumenta a velocidade da queda
        }
    }

    return { updatePlayerMovement };
}