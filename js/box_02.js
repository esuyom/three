import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

const totalNum = 9; //전체 액자 갯수
const distance = 70;

let scene, camera, renderer, controls;
let galleryGroup = new THREE.Group();
let pageNum = 0;
let targetNum = 0;
let moveX = 0;

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#39393a"); //배경 컬러
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 0, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; //PCFShadowMap
    //그림자 활성화

    document.body.appendChild(renderer.domElement);

    // const axes = new THREE.AxesHelper(150);
    // scene.add(axes);

    // const gridHelper = new THREE.GridHelper(240, 20);
    // scene.add(gridHelper);

    //조명 넣기
    var light = new THREE.HemisphereLight(0xffffff, 0x080820,1);
    light.position.set(0, 50, 50);
    scene.add(light);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 42;

    // 수평 회전 (좌우)
    controls.minAzimuthAngle = -Math.PI / 4;  // 최소 값
    controls.maxAzimuthAngle = Math.PI / 4;   // 최대 값


    {
        //가벽 만들기
        // const imageMap = new THREE.TextureLoader().load("./image/hardwood.jpg");

        // imageMap.wrapS = THREE.RepeatWrapping;
        // imageMap.wrapT = THREE.RepeatWrapping;
        // imageMap.repeat.set(10, 4);

        const wallWidth = distance * totalNum + distance;
        const geometry = new THREE.BoxGeometry(wallWidth, 100, 2);
        const material = new THREE.MeshPhongMaterial({
            // map: imageMap,
            color: 0x424242,
        });
        const wallMesh = new THREE.Mesh(geometry, material);

        wallMesh.position.set(wallWidth / 2 - distance , 0, -1.5);
        wallMesh.receiveShadow = true;
        // wallMesh.castShadow = true;
        galleryGroup.add(wallMesh);
        scene.add(galleryGroup);
    }

    for (let i = 0; i < totalNum; i++) {
        addBox(i);
    }
};

//액자 추가
const addBox = (i) => {
    const imageMap = new THREE.TextureLoader().load(
        "./image/img" + i + ".jpg"
    );
    const geometry = new THREE.BoxGeometry(20, 32, 1);
    const material = new THREE.MeshPhongMaterial({
        map: imageMap,
    });
    const boxMesh = new THREE.Mesh(geometry, material);
    boxMesh.castShadow = true;
    let x = i * distance;
    let y = 0; 
    let z = 0;
    boxMesh.position.set(x, y, z);
    galleryGroup.add(boxMesh);

    // 조명 추가
    const spotLight = new THREE.SpotLight(0xffffff, 1.7);
    spotLight.position.set(x, 52, 30);
    spotLight.angle = Math.PI / 9;
    spotLight.penumbra = 0.1;
    spotLight.decay = 1;
    spotLight.distance = 70;
    spotLight.target = boxMesh;
    spotLight.castShadow = true;

    galleryGroup.add(spotLight);

    // 클릭 이벤트 버블링 방지
    boxMesh.userData.isBox = true;
};

const animate = () => {
    controls.update();

    moveX += (targetNum - moveX) * 0.07;
    galleryGroup.position.x = moveX;

    camera.lookAt(scene.position);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

const clickFunc = (event) => {
    // 클릭된 객체 확인
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(galleryGroup.children, true);

    // addBox에서 생성된 박스를 클릭한 경우 함수 실행 막기
    if (intersects.length > 0 && intersects[0].object.userData.isBox) {
        return;
    }

    if (event.pageX < WIDTH / 2) {
        if (pageNum > 0) {
            pageNum -= 1;
        }
    } else {
        if (pageNum < totalNum - 1) {
            pageNum += 1;
        }
    }
    targetNum = -(pageNum * distance);
};


init();
animate();
window.addEventListener("resize", stageResize);
document.addEventListener("click", clickFunc);
// document.addEventListener("wheel", scrollFunc);
