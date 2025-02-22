export class V3Math {
    static add(v1, v2) {
        if (v1.x == undefined) {
            v1.x = 0;
        }
        if (v1.x == undefined) {
            v1.y = 0;
        }
        if (v1.x == undefined) {
            v1.z = 0;
        }
        if (v1.x == undefined) {
            v2.x = 0;
        }
        if (v1.x == undefined) {
            v2.y = 0;
        }
        if (v1.x == undefined) {
            v2.z = 0;
        }
        let dx = v1.x + v2.x;
        let dy = v1.y + v2.y;
        let dz = v1.z + v2.z;
        let value = { x: dx, y: dy, z: dz };
        return value;
    }
    ;
    static dist(v1, v2) {
        if (v1.x == undefined) {
            v1.x = 0;
        }
        if (v1.x == undefined) {
            v1.y = 0;
        }
        if (v1.x == undefined) {
            v1.z = 0;
        }
        if (v1.x == undefined) {
            v2.x = 0;
        }
        if (v1.x == undefined) {
            v2.y = 0;
        }
        if (v1.x == undefined) {
            v2.z = 0;
        }
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        let dz = v2.z - v1.z;
        let value = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
        return value;
    }
    ;
}
