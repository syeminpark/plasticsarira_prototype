//사리생성장면과 가상환경 장면의 카메라, 렌더링, 등을 총괄하는 클라스 
let threeSystemController
let bodySystem;

let particleSystem_microPlastic;

setup()
draw()

function setup() {
    threeSystemController = new ThreeSystemController();
    bodySystem= new BodySystem();

    particleSystem_microPlastic = new ParticleSystem(3000, 50);

    ///예시 코드 
    threeSystemController.addToWorldScene(particleSystem_microPlastic.points);
}

function draw() {
    requestAnimationFrame(draw);
    //매 프레임 실행되는 부분
    threeSystemController.update()
    bodySystem.update()

    particleSystem_microPlastic.update();
}

//------------------------------------------------------------------

