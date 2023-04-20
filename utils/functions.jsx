export const getWindowDimensions = window => {
    if(typeof window !== "undefined") {
        const { innerWidth: width, innerHeight: height } = window;
        return {
            width,
            height
        };
    }
    else return null;
};