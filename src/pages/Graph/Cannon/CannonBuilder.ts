import * as CANNON from 'cannon-es';
import { AxesHelper, BoxGeometry, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import CannonDebugger from 'cannon-es-debugger';
import RendererCore from '@/utils/RendererCore';

export default class CannonBuilder {
  renderer: RendererCore;

  physicsWorld: CANNON.World;

  floor3D?: Object3D;

  car3D?: Object3D;

  wheels3D: Object3D[] = [];

  carInfo?: { body: CANNON.Body; wheelBodies: CANNON.Body[] };

  carMoving: boolean = false;

  raycastVehicle?: CANNON.RaycastVehicle;

  stats!: Stats;

  lastCallTime: number = 0;

  cDebugger?: any;

  animationId?: number;

  obstacle?: { bodys: CANNON.Body[]; meshs: Object3D[] };

  isObstacleMoving: boolean = false;

  isObstacleMovingTimeout: number | null = null;

  constructor(renderer: RendererCore) {
    this.renderer = renderer;
    this.renderer.camera.position.set(0, 5, 25);
    this.renderer.camera.updateProjectionMatrix();
    this.physicsWorld = new CANNON.World({
      // allowSleep: true,
      gravity: new CANNON.Vec3(0, -9.8, 0),
    });
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
    this.renderer.add(new AxesHelper(20));
    this.cDebugger = CannonDebugger(this.renderer.scene, this.physicsWorld, {
      color: '#f44034',
    });
    // this.initStats();
    this.createFloor();
    this.createObstacle();
    const groundMaterial = new CANNON.Material('groundMaterial');
    const wheelMaterial = new CANNON.Material('wheelMaterial');
    const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
      // 摩擦系数
      friction: 0.5,
      // 反弹系数
      restitution: 0,
    });
    this.physicsWorld.addContactMaterial(wheelGroundContactMaterial);
    this.addListenerEvents();
  }

  dispose() {
    this.renderer.cleanup(this.car3D, this.floor3D, ...this.wheels3D);
    this.physicsWorld.clearForces();
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
    }
    this.removeListenerEvents();
  }

  initStats() {
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
  }

  createFloor() {
    const floorBody = new CANNON.Body({
      mass: 0,
      material: new CANNON.Material({ friction: 0.5 }),
    });
    floorBody.mass = 0;
    floorBody.addShape(new CANNON.Plane());
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
    this.physicsWorld.addBody(floorBody);

    const floor = new Mesh(new PlaneGeometry(100, 100), new MeshBasicMaterial({ color: 0xd5d5d5 }));

    floor.rotation.x = -Math.PI * 0.5;
    this.floor3D = floor;
    this.renderer.add(this.floor3D);
  }

  addCar(car: Object3D, wheel: Object3D) {
    this.car3D = car;
    const size = { w: 1, h: 2.5 };
    const body = new CANNON.Body({
      mass: 200,
      shape: new CANNON.Box(new CANNON.Vec3(size.w, 0.4, size.h)),
      material: new CANNON.Material({ friction: 0.5 }),
    });
    this.raycastVehicle = new CANNON.RaycastVehicle({
      chassisBody: body,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });
    this.raycastVehicle.addToWorld(this.physicsWorld);

    const options = {
      radius: 0.3,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.3,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 1000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    };
    const w = size.w - 0.1;
    const h = size.h - 0.95;
    options.chassisConnectionPointLocal.set(w, -0.1, -h);
    this.raycastVehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(-w, -0.1, -h);
    this.raycastVehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(w, -0.1, h);
    this.raycastVehicle.addWheel(options);
    options.chassisConnectionPointLocal.set(-w, -0.1, h);
    this.raycastVehicle.addWheel(options);

    const wheelBodies: CANNON.Body[] = [];

    for (let i = 0; i < this.raycastVehicle.wheelInfos.length; i += 1) {
      const wheelBody = new CANNON.Body({
        mass: 1,
        material: new CANNON.Material({ friction: 0.5 }),
      });
      const r = this.raycastVehicle.wheelInfos[i].radius;
      const shape = new CANNON.Cylinder(r, r, r / 2, 20);

      const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
      wheelBody.addShape(shape, new CANNON.Vec3(), quaternion);
      wheelBodies.push(wheelBody);

      const cloneWheel = wheel.clone();
      this.wheels3D.push(cloneWheel);
    }

    this.carInfo = { body, wheelBodies };
    this.renderer.add(this.car3D, ...this.wheels3D);
    this.renderer.render();
    this.resetCar();
    this.tick();
  }

  createObstacle() {
    const size = 0.6;
    const y = size / 2;
    const generateTriangle = (n: number) => {
      const maxY = y + (n - 1) * size;
      const pyramid = [];
      for (let i = 0; i < n; i += 1) {
        const row = [];
        for (let j = 0; j <= i; j += 1) {
          row.push([j - i / 2, maxY - i * size, 10]);
        }
        pyramid.push(row);
      }
      return pyramid.flat();
    };

    const meshs: Object3D[] = [];
    const bodys: CANNON.Body[] = [];

    const positions = generateTriangle(4);
    const boxGeom = new BoxGeometry(size, size, size);
    const mesh = new Mesh(boxGeom, new MeshBasicMaterial({ color: 0xffffff }));
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));

    // mesh.position.set(0, 0, 10);
    positions.forEach((p) => {
      const clone = mesh.clone();
      meshs.push(clone);
      const body = new CANNON.Body({
        mass: 10,
      });
      body.addShape(shape);
      body.position.set(p[0], p[1], p[2]);
      bodys.push(body);
      this.physicsWorld.addBody(body);
    });
    this.renderer.add(...meshs);
    this.obstacle = { meshs, bodys };
  }

  // startAlongLine() {
  //   const line = [
  //     [0, 0],
  //     [0, 1],
  //     [1, 1],
  //     [1, 0],
  //     [0, 0],
  //   ];
  //   console.log(this.raycastVehicle?.numWheelsOnGround);
  // }

  brakeVehicle() {
    if (this.raycastVehicle) {
      this.raycastVehicle.setBrake(50, 0);
      this.raycastVehicle.setBrake(50, 1);
      this.raycastVehicle.setBrake(50, 2);
      this.raycastVehicle.setBrake(50, 3);
    }
  }

  resetCar() {
    if (this.raycastVehicle) {
      const { chassisBody } = this.raycastVehicle;
      const h = 0.6;
      chassisBody.position.set(0, h, 0);
      chassisBody.quaternion.set(0, 0, 0, 1);
      chassisBody.angularVelocity.set(0, 0, 0);
      chassisBody.velocity.set(0, 0, 0);
    }
  }

  handleKeydown = (e: KeyboardEvent) => {
    if (!this.carInfo || !this.raycastVehicle) {
      return;
    }
    this.carMoving = true;
    const maxForce = 750;
    const maxSteerVal = 0.5;
    this.raycastVehicle.setBrake(10, 0);
    this.raycastVehicle.setBrake(10, 1);
    this.raycastVehicle.setBrake(10, 2);
    this.raycastVehicle.setBrake(10, 3);
    switch (e.key) {
      case 'w':
        // this.carGroup.body.applyImpulse(new CANNON.Vec3(1, 0, 0));
        this.raycastVehicle.applyEngineForce(maxForce * -1, 0);
        this.raycastVehicle.applyEngineForce(maxForce * -1, 1);
        this.raycastVehicle.applyEngineForce(maxForce * -1, 2);
        this.raycastVehicle.applyEngineForce(maxForce * -1, 3);
        break;
      case 's':
        this.raycastVehicle.applyEngineForce(maxForce * 1, 0);
        this.raycastVehicle.applyEngineForce(maxForce * 1, 1);
        this.raycastVehicle.applyEngineForce(maxForce * 1, 2);
        this.raycastVehicle.applyEngineForce(maxForce * 1, 3);
        break;
      case 'a':
        this.raycastVehicle.setSteeringValue(maxSteerVal * 1, 2);
        this.raycastVehicle.setSteeringValue(maxSteerVal * 1, 3);
        break;
      case 'd':
        this.raycastVehicle.setSteeringValue(maxSteerVal * -1, 2);
        this.raycastVehicle.setSteeringValue(maxSteerVal * -1, 3);
        break;
      case 'r':
        this.resetCar();
        break;
      case 'q':
        {
          const slowDownCar = 19.6;
          this.raycastVehicle.setBrake(slowDownCar, 0);
          this.raycastVehicle.setBrake(slowDownCar, 1);
          this.raycastVehicle.setBrake(slowDownCar, 2);
          this.raycastVehicle.setBrake(slowDownCar, 3);
          this.raycastVehicle.setSteeringValue(0, 2);
          this.raycastVehicle.setSteeringValue(0, 3);
        }
        break;
      default:
        this.brakeVehicle();
        break;
    }
  };

  handleKeyup = () => {
    this.brakeVehicle();
    setTimeout(() => {
      this.carMoving = false;
    }, 2000);
  };

  handleUpdateWheel = () => {
    // if (!this.carMoving) {
    //   return;
    // }
    if (!this.raycastVehicle || !this.carInfo || !this.carInfo.wheelBodies.length || !this.car3D) {
      return;
    }
    const p = this.raycastVehicle.chassisBody.position;
    this.car3D.position.set(p.x, p.y - 0.7, p.z);
    this.car3D.quaternion.copy(this.raycastVehicle.chassisBody.quaternion);
    for (let i = 0; i < this.raycastVehicle.wheelInfos.length; i += 1) {
      this.raycastVehicle.updateWheelTransform(i);
      const t = this.raycastVehicle.wheelInfos[i].worldTransform;
      this.wheels3D[i].position.copy(t.position);
      this.wheels3D[i].quaternion.copy(t.quaternion);
    }
    this.updateObstacle();
  };

  updateObstacle = () => {
    if (this.obstacle) {
      const { meshs, bodys } = this.obstacle;
      meshs.forEach((obj, i) => {
        const body = bodys[i];
        obj.position.copy(body.position);
        obj.quaternion.copy(body.quaternion);
      });
    }
  };

  tick = () => {
    // if (!this.carMoving) {
    //   return;
    // }
    const timeStep = 1 / 60;
    // this.stats.begin();
    // Update controls
    this.cDebugger.update();
    const time = performance.now() / 1000; // seconds
    if (!this.lastCallTime) {
      this.physicsWorld.step(timeStep);
    } else {
      const dt = time - this.lastCallTime;
      this.physicsWorld.step(timeStep, dt);
    }
    this.lastCallTime = time;

    // Render
    this.renderer.render();
    // this.stats.end();

    // Call tick again on the next frame
    this.animationId = window.requestAnimationFrame(this.tick);
  };

  handleContact = () => {
    this.isObstacleMoving = true;
    if (this.isObstacleMovingTimeout) {
      clearTimeout(this.isObstacleMovingTimeout);
    }
    setTimeout(() => {
      this.isObstacleMoving = false;
    }, 2000);
  };

  addListenerEvents() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);
    this.physicsWorld.addEventListener('postStep', this.handleUpdateWheel);
    this.physicsWorld.addEventListener('beginContact', this.handleContact);
  }

  removeListenerEvents() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keydown', this.handleKeydown);
    this.physicsWorld.removeEventListener('postStep', this.handleUpdateWheel);
    this.physicsWorld.removeEventListener('beginContact', this.handleContact);
  }
}
