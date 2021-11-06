class Life {
    constructor(index, windowSize, threeSystemController) {
        const { Perlin } = THREE_Noise;
        this.perlin = new Perlin(Math.random());

        this.index = index;

        this.position = new THREE.Vector3(
            random(-windowSize, windowSize),
            random(-windowSize, windowSize),
            random(-windowSize, windowSize));

        if (this.position.length() > windowSize) this.position.setLength(windowSize);

        this.velocity = new THREE.Vector3(
            random(-0.01, 0.01),
            random(-0.01, 0.01),
            random(-0.01, 0.01));
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.angle = new THREE.Vector3(
            random(0, Math.PI * 2),
            random(0, Math.PI * 2),
            random(0, Math.PI * 2));
        this.angleVelocity = this.velocity.clone();
        this.angleAcceleration = this.acceleration.clone();

        this.size = random(2, 5);
        this.sizeMax = random(0, 20);
        this.mass = this.size + this.sizeMax;

        this.noiseShape = random(0.05, 0.3);
        this.noiseAnimSpeed = random(0.1, 0.5);

        this.isEat = false;
        this.accumulatedParticles = [];
        this.sariraPosition = new THREE.Vector3();
        this.sariraType = Math.floor(random(1, 4));

        this.microPlastic_maxAmount = (this.size + this.sizeMax) * 5;
        this.eatSpeed = (this.size+this.sizeMax)*1/1000;
        this.breathSpeed = (this.size+this.sizeMax)*1/100;

        this.display(threeSystemController);
        this.noise_set();

        //======================================================
        
        this.sarira_amount;

        this.sarira_makingSpeed;

        this.movement;

        this.lifespan;

        this.division_speed;

        this.nutrients;

        this.toxicResistance;
    }

    update() {
        this.randomWalk(0.01, 0.1);
        this.randomLook();
    }

    randomWalk(acc, velLimit) {
        this.life.position.set(this.position.x, this.position.y, this.position.z);
        this.position = this.life.position;
        this.acceleration.add(new THREE.Vector3(
            random(-acc, acc),
            random(-acc, acc),
            random(-acc, acc)
        ));
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        if (this.velocity.length() > velLimit) this.velocity.multiplyScalar(0.01);
        this.acceleration.setLength(0);
    }

    randomLook() {
        this.life.rotation.set(this.angle.x, this.angle.y, this.angle.z);
        this.angleAcceleration.add(new THREE.Vector3(
            random(-0.001, 0.001),
            random(-0.001, 0.001),
            random(-0.001, 0.001)
        ));
        this.angleVelocity.add(this.angleAcceleration);
        this.angle.add(this.angleVelocity);
        if (this.angleVelocity.length() > 0.025) this.angleVelocity.multiplyScalar(0.1);
        this.angleVelocity.clampLength(0, 0.05);
        this.angleAcceleration.setLength(0);
    }

    display(threeSystemController) {
        var geometry = new THREE.SphereGeometry(this.size, 32, 32);
        // var material = new THREE.MeshNormalMaterial({
        //     transparent:true,
        //     opacity:0.8,
        //     depthTest:false,
        //     shadowSide:3
        // });
        var material = new THREE.MeshDepthMaterial({
            transparent: true,
            opacity: 0.5,
        });
        this.life = new THREE.Mesh(geometry, material);
        this.life.position.set(this.position.x, this.position.y, this.position.z);
        this.life.rotation.set(this.angle.x, this.angle.y, this.angle.z);

        threeSystemController.addToWorldScene(this.life);

        //glow
        var map = new THREE.TextureLoader().load('images/glow.png')
        var spriteMaterial = new THREE.SpriteMaterial({
            map: map,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        })
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(
            ((this.size * 2) + this.sizeMax) * 2,
            ((this.size * 2) + this.sizeMax) * 2,
            1.0);
        this.life.add(sprite);

        this.make_sarira();
    }

    noise_set() {
        this.n_position = this.life.geometry.attributes.position.clone();
        this.n_normal = this.life.geometry.attributes.normal.clone();
        this.n_position_num = this.n_position.count;

        this.clock = new THREE.Clock();
    }

    noise_animate() {
        const position = this.life.geometry.attributes.position;
        const normal = this.life.geometry.attributes.normal;
        const elapsedTime = this.clock.getElapsedTime();

        const noise = [];
        for (let i = 0; i < this.n_position_num; i++) {
            const pos = new THREE.Vector3().fromBufferAttribute(this.n_position, i);
            const norm = new THREE.Vector3().fromBufferAttribute(this.n_normal, i);
            const newPos = pos.clone();

            pos.multiplyScalar(this.noiseShape);
            pos.x += elapsedTime * this.noiseAnimSpeed;
            const n = this.perlin.get3(pos) * this.sizeMax;

            newPos.add(norm.multiplyScalar(n));

            noise.push(newPos);
        }

        position.copyVector3sArray(noise);

        this.sariraPosition = noise[Math.floor(random(0, 1089))];

        this.life.geometry.computeVertexNormals();
        this.life.geometry.attributes.position.needsUpdate = true;
    }

    wrap(size) {
        const distance = this.position.length();

        if (distance > size) {
            this.velocity.multiplyScalar(-1);
        }
    }

    absorb(microPlastic) {
        const distance = this.position.distanceTo(microPlastic.position);
        const lifeSize = (this.size + this.sizeMax) * 1;
        var sariraPos = this.position;

        var force = new THREE.Vector3().subVectors(sariraPos, microPlastic.position);

        if (microPlastic.isEaten == false && this.accumulatedParticles.length < this.microPlastic_maxAmount) {
            //아직 먹히지 않은 상태의 파티클 끌어당기기
            if (distance < lifeSize && distance > this.size / 2) {
                force.multiplyScalar(0.02);
                microPlastic.applyForce(force);
            }

            //파티클 먹고 파티클 상태 먹힌것으로 변경
            if (distance < this.size * 0.5) {
                this.accumulatedParticles.push(microPlastic);
   
                microPlastic.isEaten = true;
                this.isEat = true;
            }
        }
    }

    eat(microPlastic){
        const distance = this.position.distanceTo(microPlastic.position);
        const lifeSize = (this.size + this.sizeMax) * 1;
        var sariraPos = this.position;
        

        var force = new THREE.Vector3().subVectors(sariraPos, microPlastic.position);

        if (microPlastic.isEaten == false && this.accumulatedParticles.length < this.microPlastic_maxAmount) {
            //아직 먹히지 않은 상태의 파티클 끌어당기기
            if (distance < lifeSize && distance > this.size / 2 && random(0,1) < this.eatSpeed) {
                force.multiplyScalar(0.02);
                microPlastic.applyForce(force);
            }

            //파티클 먹고 파티클 상태 먹힌것으로 변경
            if (distance < this.size * 0.5) {
                this.accumulatedParticles.push(microPlastic);
   
                microPlastic.isEaten = true;
                this.isEat = true;
            }
        }
    }

    breath(microPlastic) {
        const distance = this.position.distanceTo(microPlastic.position);
        const lifeSize = (this.size + this.sizeMax) * 1;
        var sariraPos = this.position;
        

        var force = new THREE.Vector3().subVectors(sariraPos, microPlastic.position);

        if (microPlastic.isEaten == false && this.accumulatedParticles.length < this.microPlastic_maxAmount) {
            //아직 먹히지 않은 상태의 파티클 끌어당기기
            if (distance < lifeSize && distance > this.size / 2) {
                force.multiplyScalar(0.02);
                microPlastic.applyForce(force);
            }

            //파티클 먹고 파티클 상태 먹힌것으로 변경
            if (distance < this.size * 0.5 && random(0, 1) < this.breathSpeed) {
                this.accumulatedParticles.push(microPlastic);
   
                microPlastic.isEaten = true;
                this.isEat = true;
            }
        }
    }

    add_MicroPlasticToBodySystem(bodySystem,threeSystem){
        if (this.isEat == true) {
            bodySystem.addFloatingPlastics(bodySystem,threeSystem);
            console.log('life eat = ' + this.isEat);
            this.isEat = false;
        }
    }

    wrap_particles() {
        var sariraPos = this.position;

        for (let i = 0; i < this.accumulatedParticles.length; i++) {
            this.accumulatedParticles[i].wrapCenter = this.position;
            this.accumulatedParticles[i].wrapSize = this.size;

            const distance = this.position.distanceTo(this.accumulatedParticles[i].position);
            var force = new THREE.Vector3().subVectors(sariraPos, this.accumulatedParticles[i].position);
            if (distance > this.size * 0.5) {
                force.multiplyScalar(0.02);
                this.accumulatedParticles[i].acceleration.add(force);
            }
        }
    }

    make_sarira() {
        const sariraSize = this.size/5;
        if (this.sariraType == 1) {
            var sariraGeometry = new THREE.SphereGeometry(
                sariraSize, 
                Math.floor(random(3, 5)), 
                Math.floor(random(2, 5)));
        } else if (this.sariraType == 2){
            var sariraGeometry = new THREE.TetrahedronGeometry(
                sariraSize, 
                Math.floor(random(0, 5)));
        } else {
            var sariraGeometry = new THREE.CircleGeometry(
                sariraSize, 
                Math.floor(random(0, 24)),
                0,
                random(0, 6.3));
        }
        
        var sariraMaterial = new THREE.MeshBasicMaterial({
            transparent: false,
            opacity: 0.5,
        });
        this.sarira = new THREE.Mesh(sariraGeometry, sariraMaterial);
        this.sarira.rotation.set(this.angle.x, this.angle.y, this.angle.z);

        this.life.add(this.sarira);
    }

    divistion() {

    }

    eaten() {

    }
}