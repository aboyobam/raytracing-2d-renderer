export default class Material {
    static readonly all: Record<string, Material> = {};
    
    constructor(public r = 256, public g = 256, public b = 256, public a = 256, public readonly name?: string) {
        if (name) {
            Material.all[name] = this;
        }
    };
}