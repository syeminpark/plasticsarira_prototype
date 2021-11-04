class ParticleSystem{
    constructor(lifeSystem){
        this.num = 10000;
        this.size = 150;

        this.particles = [];
        this.p_positions = [];
        
        for (let i = 0; i < this.num; i++) {
            var p = new MicroPlastic(i, this.size);
            this.particles.push(p);
            this.p_positions.push(p.position);
        }

        this.display();

        this.lifes = lifeSystem.lifes; //array
        this.life_user = lifeSystem.life_user;
    }

    update(){
        const positions = this.points.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const index = i/3;

            positions[i+0] = this.particles[index].position.x;
            positions[i+1] = this.particles[index].position.y;
            positions[i+2] = this.particles[index].position.z;

            this.particles[index].update();

            for (let j = 0; j < this.lifes.length; j++) {
                this.lifes[j].eat(this.particles[index]);  
            }
            this.life_user.eat(this.particles[index]);
        }

        this.points.geometry.attributes.position.needsUpdate = true;
    }

    display(){
        var geometry = new THREE.BufferGeometry().setFromPoints(this.p_positions);
        
        var material = new THREE.PointsMaterial({
            size: random(0.1, 0.9),
            color:'white'
        });
        //var material = new THREE.MeshNormalMaterial({wireframe:false});

        this.points = new THREE.Points(geometry, material);
        this.points.position.set(0, 0, 0);

        threeSystemController.addToWorldScene(this.points);
    }
}