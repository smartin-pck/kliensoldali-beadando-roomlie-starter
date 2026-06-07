export function getNeptunHeader() {
    const neptunCode = import.meta.env.VITE_NEPTUN_CODE;

    if (!neptunCode) {
        return {};
    }

    return {
        "X-Neptun-Code": neptunCode,
    };
}