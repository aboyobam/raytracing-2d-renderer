export const serializableClasses: Record<string, new(...args: any[]) => {}> = {};

export default function serializable(name: string) {
    return function<T extends new(...args: any[]) => any>(Class: T): T {
        serializableClasses[name] = Class;

        return class extends Class {
            readonly __class = name;
        } as T;
    }
}

export function deserialize(object: any, seen = new Set<{}>()) {
    if (!object || seen.has(object)) {
        return;
    }

    if (Array.isArray(object)) {
        for (const entry of object) {
            deserialize(entry, seen);
        }
    } else if (typeof object === "object") {
        if (object.__class) {
            const Class = serializableClasses[object.__class];
            if (!(object instanceof Class)) {
                Object.setPrototypeOf(object, Class.prototype);
            }
        }

        seen.add(object);

        for (const v of Object.values(object)) {
            deserialize(v, seen);
        }
    }
}