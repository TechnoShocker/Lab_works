/**
 * AR Demo з кастомним маркером
 * Три об'єкти з різними матеріалами:
 * 1. Куб (зелений) - MeshStandardMaterial
 * 2. Сфера (синя) - MeshPhongMaterial
 * 3. Тор (червоний) - MeshLambertMaterial
 */

console.log('THREE:', typeof THREE);
console.log('THREEx:', typeof THREEx);

// Перевірка завантаження бібліотек
if (typeof THREE === 'undefined') {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').innerHTML = '<strong>Помилка!</strong><br>Three.js не завантажився. Перевірте інтернет з\'єднання.';
} else if (typeof THREEx === 'undefined') {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').innerHTML = '<strong>Помилка!</strong><br>AR.js не завантажився. Перевірте інтернет з\'єднання.';
} else {
    initAR();
}

function initAR() {
    // === Ініціалізація сцени Three.js ===
    const scene = new THREE.Scene();

    // Створення камери
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(0, 0, 5);

    // Створення рендерера з прозорістю
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color('lightgrey'), 0);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // === AR.js - джерело відео (вебкамера) ===
    const arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
        sourceWidth: window.innerWidth,
        sourceHeight: window.innerHeight,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight
    });

    // AR.js контекст (оголошуємо тут для доступу в回调ах)
    let arToolkitContext;

    arToolkitSource.init(function onReady() {
        document.getElementById('loading').style.display = 'none';
        window.addEventListener('resize', () => {
            arToolkitSource.onResizeElement();
            arToolkitSource.copyElementSizeTo(renderer.domElement);
            if (arToolkitContext && arToolkitContext.arController) {
                arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
            }
        });
        window.dispatchEvent(new Event('resize'));
    }, function onError(error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerHTML = '<strong>Помилка доступу до камери!</strong><br><br>' +
            'Можливі рішення:<br>' +
            '1. Дозвольте доступ до камери в браузері<br>' +
            '2. Переконайтеся, що камера не використовується іншою програмою<br>' +
            '3. Використовуйте HTTPS або localhost';
    });

    // === AR.js - контекст для виявлення маркерів ===
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://jeromeetienne.github.io/AR.js/data/data/camera_para.dat',
        detectionMode: 'mono_and_matrix'
    });

    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        console.log('AR.js контекст ініціалізовано');
    });

    // === Контейнер для об'єктів на маркері ===
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);

    // === Освітлення для матеріалів ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // === Три різні геометричні об'єкти з різними матеріалами ===

    // 1. Куб - MeshStandardMaterial (зелений, металевий)
    const cubeGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x2ecc71,      // Зелений колір
        metalness: 0.7,       // Металевість
        roughness: 0.3        // Шорсткість
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-0.7, 0, 0);
    markerGroup.add(cube);

    // 2. Сфера - MeshPhongMaterial (синя, глянцева)
    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x3498db,      // Синій колір
        shininess: 100,       // Блиск
        specular: 0x444444    // Відблиск
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0.25, 0);
    markerGroup.add(sphere);

    // 3. Тор (Torus) - MeshLambertMaterial (червоний, матовий)
    const torusGeometry = new THREE.TorusGeometry(0.2, 0.08, 16, 100);
    const torusMaterial = new THREE.MeshLambertMaterial({
        color: 0xe74c3c,           // Червоний колір
        emissive: 0x330000,        // Випромінювання
        emissiveIntensity: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0.7, 0, 0);
    markerGroup.add(torus);

    // === Управління кастомним маркером ===
    const markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerGroup, {
        type: 'pattern',
        patternUrl: 'custom-marker.patt'
    });

    // === Анімація об'єктів ===
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);

        if (arToolkitSource.ready) {
            arToolkitContext.update(arToolkitSource.domElement);
        }

        time += 0.02;

        // Обертання куба
        cube.rotation.x = time;
        cube.rotation.y = time * 0.7;

        // Плаваюча сфера
        sphere.position.y = 0.25 + Math.sin(time) * 0.1;

        // Обертання тора
        torus.rotation.x = time * 0.8;
        torus.rotation.z = time * 0.5;

        renderer.render(scene, camera);
    }

    animate();
}