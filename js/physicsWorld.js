export function setupPhysicsWorld() {
	const world = new CANNON.World();
	world.gravity.set(0, -9.82, 0); // Gravidade da Terra

	// Criar um corpo físico para o jogador
	const playerShape = new CANNON.Sphere(0.5);
	const playerBody = new CANNON.Body({ mass: 1 });
	playerBody.addShape(playerShape);
	playerBody.position.set(0, 10, 0); // Posição inicial do jogador (acima do chão)
	world.addBody(playerBody);

	// Chão físico
	const groundShape = new CANNON.Plane();
	const groundBody = new CANNON.Body({ mass: 0 });
	groundBody.addShape(groundShape);
	groundBody.quaternion.setFromAxisAngle(
		new CANNON.Vec3(1, 0, 0),
		-Math.PI / 2
	);
	world.addBody(groundBody);

	// Criar um corpo físico para a caixa
	const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)); // Tamanho da caixa
	const boxBody = new CANNON.Body({ mass: 1 }); // Massa da caixa (pode ser movida)
	boxBody.addShape(boxShape);
	boxBody.position.set(2, 1, 0); // Posição inicial da caixa
	world.addBody(boxBody);

	boxBody.material = new CANNON.Material();
	const groundMaterial = new CANNON.Material();
	const contactMaterial = new CANNON.ContactMaterial(
		boxBody.material,
		groundMaterial,
		{ friction: 0.5, restitution: 0.3 }
	);
	world.addContactMaterial(contactMaterial);

	return { world, playerBody, boxBody };
}
