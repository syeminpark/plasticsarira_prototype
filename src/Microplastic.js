class Microplastic {

    //later create size and color parameter
    constructor(positionList) {
        this.velocity = new THREE.Vector3(1, 0, 0)
        this.acceleration = new THREE.Vector3(0, 0, 0)
        this.positionVector3 = new THREE.Vector3(0, 0, 0)
        this.positionList = positionList || this.randomPoint()
        this.color = [1,1,1]// [Math.random(), Math.random(), Math.random()]
        this.size =  50 //Math.random() * (50 - 1) + 1
    }

    initialize(pastOwnersList, retrievedMethod, dateRetrieved) {
        this.pastOwnersList = pastOwnersList || "Empty"
        //this.pastOwnersList = this.pastOwnersList.toString()
        this.retrievedMethod = retrievedMethod || "Empty"
        this.dateRetrieved = dateRetrieved || "Empty"

        this.originalPurpose = this.originalPurposeList[Math.round(random(0, this.originalPurposeList.length-1))]
        this.dateCreated = JSON.stringify(Math.round(random(this.dateCreated, 2021)));

        this.mass = this.density * this.size
        this.tensileStrength = map(this.tensileStrength, 4400, 12400, 0, 100)

        this.passDataList = [this.type, this.dateCreated, this.originalPurpose, this.pastOwnersList, this.retrievedMethod, this.dateRetrieved]
    }

    applyForce(force) {
        let f = _.cloneDeep(force)
        f.divideScalar(this.mass);
        this.acceleration.add(f);
    }

    walk(bufferGeometry, index) {
        this.velocity.add(this.acceleration)
        bufferGeometry.attributes.position.array[index * 3] += this.velocity.x
        bufferGeometry.attributes.position.array[(index * 3) + 1] += this.velocity.y
        bufferGeometry.attributes.position.array[(index * 3) + 2] += this.velocity.z
        this.acceleration.multiplyScalar(0)
    }
    getPosition(bufferGeometry, index) {
        bufferGeometry.attributes.position.needsUpdate = true
        bufferGeometry.attributes.color.needsUpdate = true
        bufferGeometry.attributes.size.needsUpdate = true

        for (let i = 0; i < 3; i++) {
            this.positionList[i] = bufferGeometry.attributes.position.array[(index * 3) + i]
        }
        this.positionVector3.set(this.positionList[0], this.positionList[1], this.positionList[2])
    }

    updateBuffer(bufferGeometry, indexLength) {
        for (let i = 0; i < 3; i++) {
            bufferGeometry.attributes.position.array[((indexLength - 1) * 3) + i] = this.positionList[i]
            bufferGeometry.attributes.color.array[((indexLength - 1) * 3) + i] = this.color[i]
        }
        bufferGeometry.attributes.size.array[indexLength - 1] = this.size
        bufferGeometry.setDrawRange(0, indexLength);
    }

    switch (bufferGeometry, index, list) {
        let lastIndex = list.length - 1
        for (let i = 0; i < 3; i++) {
            bufferGeometry.attributes.position.array[(index * 3) + i] = bufferGeometry.attributes.position.array[(lastIndex * 3) + i]
            bufferGeometry.attributes.color.array[(index * 3) + i] = bufferGeometry.attributes.color.array[(lastIndex * 3) + i]
        }
        bufferGeometry.attributes.size.array[index] = bufferGeometry.attributes.size.array[lastIndex]

        for (let i = 0; i < 3; i++) {
            bufferGeometry.attributes.position.array[(lastIndex * 3) + i] = 0
            bufferGeometry.attributes.color.array[(lastIndex * 3) + i] = 0
        }
        bufferGeometry.attributes.size.array[lastIndex] = 0

        list[index] = list[lastIndex]
        list.splice(lastIndex, 1)
        bufferGeometry.setDrawRange(0, lastIndex);
    }

    checkStuck(others) {
        for (let i = 0; i < others.length; i++) {
            let d2 = this.positionVector3.distanceTo(others[i].positionVector3)
            if ((d2 < this.size / 5 + others[i].size / 5) *
                (this.tensileStrength + others[i].tensileStrength) / 2) {
                return true
            }
        }
        return false
    }

    randomPoint() {
        let i = Math.round(Math.random() * 5)
        let randomX = Math.random() * (threeSystemController.sariraThreeSystem.controls.object.position.x + threeSystemController.sariraThreeSystem.controls.object.position.x) - threeSystemController.sariraThreeSystem.controls.object.position.x;
        let randomY = Math.random() * (threeSystemController.sariraThreeSystem.controls.object.position.y*2 + threeSystemController.sariraThreeSystem.controls.object.position.y*2) - threeSystemController.sariraThreeSystem.controls.object.position.y*2;
        let randomZ = Math.random() * (threeSystemController.sariraThreeSystem.controls.object.position.z*2 + threeSystemController.sariraThreeSystem.controls.object.position.z) - threeSystemController.sariraThreeSystem.controls.object.position.z;
        let randPoint;

        if (i === 0) {
            //top
            randPoint = [randomX, threeSystemController.sariraThreeSystem.controls.object.position.y * 2, randomZ]
            //bottom
        } else if (i == 1) {
            randPoint = [randomX, -threeSystemController.sariraThreeSystem.controls.object.position.y * 2, randomZ]
            //left
        } else if (i == 2) {
            randPoint = [-threeSystemController.sariraThreeSystem.controls.object.position.x * 2, randomY, randomZ]
            //right 
        } else if (i == 3) {
            randPoint = [threeSystemController.sariraThreeSystem.controls.object.position.x * 2, randomY, randomZ]
        }
        //front
        else if (i == 4) {
            randPoint = [randomX, randomY, threeSystemController.sariraThreeSystem.controls.object.position.z*2]
        }
        //back     
        else {
            randPoint = [randomX, randomY, -threeSystemController.sariraThreeSystem.controls.object.position.z*2]
        }
        return randPoint
    }
}