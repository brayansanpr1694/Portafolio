// app.js - Cubo Rubik 3D con colores fijos hacia afuera

let scene, camera, renderer, controls;
const cubes = [];
const cubeSize = 3;
let isRotating = false;
let selectedFace = null;
//console.log("Seleccionado:", selectedFace, "materialIndex:", materialIndex);


const faceIndices = ["x1", "x2", "y1", "y2", "z1", "z2"];
const faceMaterialOrder = [0, 1, 3, 2, 5, 4]; // Materiales en orden [x1, x2, y2, y1, z2, z1]

const faceColorMap = {
  x1: 0xffa500, // izquierda - naranja
  x2: 0xff0000, // derecha - rojo
  y1: 0x00ff00, // abajo - verde
  y2: 0xffff00, // arriba - amarillo
  z1: 0x0000ff, // atrás - azul
  z2: 0xffffff  // frente - blanco
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  createRubiksCube();

document.getElementById("rotateLeft").onclick = () => {
  if (selectedFace && !isRotating) {
    rotateFace(selectedFace.axis, selectedFace.index, Math.PI / 2);
  } else {
    console.warn("Ninguna cara seleccionada");
  }
};

document.getElementById("rotateRight").onclick = () => {
  if (selectedFace && !isRotating) {
    rotateFace(selectedFace.axis, selectedFace.index, -Math.PI / 2);
  } else {
    console.warn("Ninguna cara seleccionada");
  }
};

  document.getElementById("shuffle").onclick = shuffleCube;
  document.getElementById("reset").onclick = resetCube;

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onDocumentClick);


  animate();
}

function createRubiksCube() {
  const size = 1;
  const offset = (cubeSize - 1) / 2;

  for (let x = 0; x < cubeSize; x++) {
    for (let y = 0; y < cubeSize; y++) {
      for (let z = 0; z < cubeSize; z++) {
    const tempMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 }); // provisional
    const cubelet = new THREE.Mesh(
    new THREE.BoxGeometry(size * 0.95, size * 0.95, size * 0.95),
    Array(6).fill(tempMaterial.clone())
    );


        const logicalPos = { x, y, z };
        const faceColors = {};
        if (x === 0) faceColors.x1 = faceColorMap.x1;
        if (x === cubeSize - 1) faceColors.x2 = faceColorMap.x2;
        if (y === 0) faceColors.y1 = faceColorMap.y1;
        if (y === cubeSize - 1) faceColors.y2 = faceColorMap.y2;
        if (z === 0) faceColors.z1 = faceColorMap.z1;
        if (z === cubeSize - 1) faceColors.z2 = faceColorMap.z2;

        cubelet.userData = {
          logicalPos,
          faceColors
        };

        updateCubeletMaterials(cubelet);

        cubelet.position.set(x - offset, y - offset, z - offset);
        cubes.push(cubelet);
        scene.add(cubelet);
      }
    }
  }
}

function updateCubeletMaterials(cubelet) {
  const colors = cubelet.userData.faceColors;

  const previousMaterials = cubelet.material.map(mat => ({
    isSelected: mat.userData?.isSelected,
    originalColor: mat.userData?.originalColor
  }));

  // Usar SIEMPRE MeshPhongMaterial
  cubelet.material = [
    new THREE.MeshPhongMaterial({ color: colors.x2 || 0x222222 }), // +x
    new THREE.MeshPhongMaterial({ color: colors.x1 || 0x222222 }), // -x
    new THREE.MeshPhongMaterial({ color: colors.y2 || 0x222222 }), // +y
    new THREE.MeshPhongMaterial({ color: colors.y1 || 0x222222 }), // -y
    new THREE.MeshPhongMaterial({ color: colors.z2 || 0x222222 }), // +z
    new THREE.MeshPhongMaterial({ color: colors.z1 || 0x222222 })  // -z
  ];

  // Restaurar selección visual
  previousMaterials.forEach((data, index) => {
    if (data?.isSelected) {
      cubelet.material[index].userData = {
        isSelected: true,
        originalColor: data.originalColor
      };
      cubelet.material[index].color.setHex(0x00ff00);
    }
  });
}

function rotateFace(axis, index, angle) {
  if (isRotating) return;
  isRotating = true;

  const selected = cubes.filter(c => c.userData.logicalPos[axis] === index);

  const center = new THREE.Vector3();
  selected.forEach(c => center.add(c.position));
  center.divideScalar(selected.length);

  const startTime = Date.now();
  const duration = 300;

  selected.forEach(cube => {
    cube.userData.initialOffset = cube.position.clone().sub(center);
  });

  function animate() {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const currentAngle = angle * t;

    selected.forEach(cube => {
      const rotated = cube.userData.initialOffset.clone().applyAxisAngle(getAxisVec(axis), currentAngle);
      cube.position.copy(center.clone().add(rotated));
    });

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      finalizeFaceRotation(selected, axis, angle);
      isRotating = false;
    }
  }

  animate();
}

function finalizeFaceRotation(cubelets, axis, angle) {
  cubelets.forEach(cube => {
    // Actualizar posición lógica
    const p = cube.userData.logicalPos;
    const relative = new THREE.Vector3(p.x - 1, p.y - 1, p.z - 1);
    relative.applyAxisAngle(getAxisVec(axis), angle);
    cube.userData.logicalPos = {
      x: Math.round(relative.x + 1),
      y: Math.round(relative.y + 1),
      z: Math.round(relative.z + 1)
    };

    // Actualizar colores de cara
    const colors = cube.userData.faceColors;
    cube.userData.faceColors = rotateFaceColors(colors, axis, angle);
    updateCubeletMaterials(cube);

    cube.position.set(
      cube.userData.logicalPos.x - 1,
      cube.userData.logicalPos.y - 1,
      cube.userData.logicalPos.z - 1
    );
  });
}

function rotateFaceColors(faceColors, axis, angle) {
  const newColors = { ...faceColors };

  const clockwise = angle > 0;

  const cycle = (a, b, c, d) => {
    const temp = newColors[a];
    newColors[a] = clockwise ? newColors[d] : newColors[b];
    newColors[b] = clockwise ? temp : newColors[c];
    newColors[c] = clockwise ? newColors[b] : newColors[d];
    newColors[d] = clockwise ? newColors[c] : temp;
  };

  if (axis === 'x') {
    cycle('y1', 'z1', 'y2', 'z2'); // x rotación: arriba, atrás, abajo, frente
  } else if (axis === 'y') {
    cycle('z1', 'x1', 'z2', 'x2'); // y rotación: atrás, izquierda, frente, derecha
  } else if (axis === 'z') {
    cycle('x1', 'y1', 'x2', 'y2'); // z rotación: izquierda, abajo, derecha, arriba
  }

  return newColors;
}

function onDocumentClick(event) {
  if (isRotating) return;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cubes);

  if (intersects.length === 0) return;

  // Limpiar selección anterior
  cubes.forEach(cube => {
    cube.material.forEach(mat => {
      if (mat.userData?.isSelected) {
        mat.color.setHex(mat.userData.originalColor);
        delete mat.userData.isSelected;
      }
    });
  });

  const intersect = intersects[0];
  const cube = intersect.object;
  const materialIndex = Math.floor(intersect.faceIndex / 2); // cara clickeada

  const normal = new THREE.Vector3()
    .copy(intersect.face.normal)
    .applyMatrix4(new THREE.Matrix4().extractRotation(cube.matrixWorld))
    .normalize();

const absNormal = new THREE.Vector3(
  Math.abs(normal.x),
  Math.abs(normal.y),
  Math.abs(normal.z)
);
  const axis = absNormal.x > absNormal.y && absNormal.x > absNormal.z ? 'x' :
               absNormal.y > absNormal.z ? 'y' : 'z';

  const direction = Math.round(normal[axis]);
  const layerIndex = cube.userData.logicalPos[axis];

  // Guardar para rotar luego
  selectedFace = { axis, index: layerIndex, direction };
  console.log("✔️ Cara seleccionada:", selectedFace);

  // Marcar cara visualmente
  const selectedMaterial = cube.material[materialIndex];
  selectedMaterial.userData = {
    isSelected: true,
    originalColor: selectedMaterial.color.getHex()
  };
  selectedMaterial.color.setHex(0x00ff00);
}


function finalizeRotation(cubelets, axis, angle) {
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
    
    cubelets.forEach(cube => {
        // Actualizar posición lógica
        const relativePos = new THREE.Vector3(
            cube.userData.logicalPos.x - 1,
            cube.userData.logicalPos.y - 1,
            cube.userData.logicalPos.z - 1
        );
        
        relativePos.applyMatrix4(rotationMatrix);
        
        cube.userData.logicalPos = {
            x: Math.round(relativePos.x + 1),
            y: Math.round(relativePos.y + 1),
            z: Math.round(relativePos.z + 1)
        };

        // Actualizar colores de caras
        cube.userData.faceColors = rotateFaceColors(
            cube.userData.faceColors, 
            axisToKey(axis), 
            angle
        );
        
        updateCubeletMaterials(cube);
    });
}

// Función auxiliar para convertir eje a clave
function axisToKey(axis) {
    return {
        x: 'x',
        y: 'y',
        z: 'z'
    }[axis];
}

// Función rotateFaceColors corregida
function rotateFaceColors(faceColors, axis, angle) {
  const newColors = { ...faceColors };
  const clockwise = angle > 0;

  const cycle = (a, b, c, d) => {
    const temp = newColors[a];
    if (clockwise) {
      newColors[a] = newColors[d];
      newColors[d] = newColors[c];
      newColors[c] = newColors[b];
      newColors[b] = temp;
    } else {
      newColors[a] = newColors[b];
      newColors[b] = newColors[c];
      newColors[c] = newColors[d];
      newColors[d] = temp;
    }
  };

  switch(axis) {
    case 'x':
      cycle('y2', 'z2', 'y1', 'z1'); // Rotación en eje X
      break;
    case 'y':
      cycle('z2', 'x2', 'z1', 'x1'); // Rotación en eje Y
      break;
    case 'z':
      cycle('x2', 'y2', 'x1', 'y1'); // Rotación en eje Z
      break;
  }

  // Limpiar colores undefined
  Object.keys(newColors).forEach(key => {
    if (newColors[key] === undefined) newColors[key] = null;
  });

  return newColors;
}

// Función updateCubeletMaterials mejorada
function updateCubeletMaterials(cubelet) {
  const colors = cubelet.userData.faceColors;
  
  // Conservar estado de selección
  const previousMaterials = cubelet.material.map(mat => ({
    isSelected: mat.userData?.isSelected,
    originalColor: mat.userData?.originalColor
  }));

  // Crear nuevos materiales
  cubelet.material = [
    new THREE.MeshPhongMaterial({ color: colors.x2 || 0x222222 }),
    new THREE.MeshPhongMaterial({ color: colors.x1 || 0x222222 }),
    new THREE.MeshPhongMaterial({ color: colors.y2 || 0x222222 }),
    new THREE.MeshPhongMaterial({ color: colors.y1 || 0x222222 }),
    new THREE.MeshPhongMaterial({ color: colors.z2 || 0x222222 }),
    new THREE.MeshPhongMaterial({ color: colors.z1 || 0x222222 })
  ];

  // Restaurar selección
  previousMaterials.forEach((data, index) => {
    if (data?.isSelected) {
      cubelet.material[index].userData = {
        isSelected: true,
        originalColor: data.originalColor
      };
      cubelet.material[index].color.setHex(0x00ff00);
    }
  });
}

// Función shuffleCube mejorada
function shuffleCube() {
  const axes = ["x", "y", "z"];
  let count = 0;
  let isShuffling = false;

  function move() {
    if (count >= 20) {
      isShuffling = false;
      return;
    }
    
    const axis = axes[Math.floor(Math.random() * 3)];
    const index = Math.floor(Math.random() * cubeSize);
    const angle = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    
    rotateFace(axis, index, angle);
    count++;
    
    if (!isShuffling) {
      isShuffling = true;
      setTimeout(move, 500);
    } else {
      requestAnimationFrame(move);
    }
  }

  move();
}

function getAxisVec(axis) {
  return axis === "x"
    ? new THREE.Vector3(1, 0, 0)
    : axis === "y"
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(0, 0, 1);
}

function resetCube() {
  // Leer colores desde los inputs y actualizar el mapa
  faceColorMap.x1 = parseInt(document.getElementById("color-x1").value.replace("#", "0x"));
  faceColorMap.x2 = parseInt(document.getElementById("color-x2").value.replace("#", "0x"));
  faceColorMap.y1 = parseInt(document.getElementById("color-y1").value.replace("#", "0x"));
  faceColorMap.y2 = parseInt(document.getElementById("color-y2").value.replace("#", "0x"));
  faceColorMap.z1 = parseInt(document.getElementById("color-z1").value.replace("#", "0x"));
  faceColorMap.z2 = parseInt(document.getElementById("color-z2").value.replace("#", "0x"));

  // Reset visual
  cubes.forEach(c => scene.remove(c));
  cubes.length = 0;
  createRubiksCube();
}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init();
