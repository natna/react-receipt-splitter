// Initialize OpenCV.js
declare const cv: any;
const OPENCV_URL = 'https://docs.opencv.org/4.8.0/opencv.js';

let opencvPromise: Promise<void> | null = null;

// Load OpenCV.js
const loadOpenCV = () => {
    if (opencvPromise) {
        return opencvPromise;
    }

    opencvPromise = new Promise<void>((resolve, reject) => {
        // Check if OpenCV is already loaded
        if (cv && typeof cv === 'object') {
            resolve();
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = OPENCV_URL;
        script.async = true;
        script.type = 'text/javascript';

        // Handle script loading
        script.onload = () => {
            // Wait for OpenCV to be ready
            const checkOpenCV = () => {
                if (cv && typeof cv === 'object') {
                    resolve();
                } else {
                    setTimeout(checkOpenCV, 100);
                }
            };
            checkOpenCV();
        };

        // Handle script errors
        script.onerror = () => {
            reject(new Error('Failed to load OpenCV.js'));
            opencvPromise = null;
        };

        // Add script to document
        document.head.appendChild(script);
    });

    return opencvPromise;
};

interface Point {
    x: number;
    y: number;
}

interface Quadrilateral {
    topLeft: Point;
    topRight: Point;
    bottomRight: Point;
    bottomLeft: Point;
}

export const correctPerspective = async (imageData: string): Promise<string> => {
    try {
        // Wait for OpenCV.js to be ready
        await loadOpenCV();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Create canvas and draw image
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }
                    ctx.drawImage(img, 0, 0);

                    // Convert image to OpenCV format
                    const src = cv.imread(canvas);
                    const gray = new cv.Mat();
                    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

                    // Apply Gaussian blur to reduce noise
                    const blurred = new cv.Mat();
                    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

                    // Apply Canny edge detection
                    const edges = new cv.Mat();
                    cv.Canny(blurred, edges, 75, 200);

                    // Find contours
                    const contours = new cv.MatVector();
                    const hierarchy = new cv.Mat();
                    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                    // Find the largest contour (should be the receipt)
                    let maxArea = 0;
                    let receiptContour = null;

                    for (let i = 0; i < contours.size(); i++) {
                        const contour = contours.get(i);
                        const area = cv.contourArea(contour);
                        if (area > maxArea) {
                            maxArea = area;
                            receiptContour = contour;
                        }
                    }

                    if (receiptContour) {
                        // Approximate the contour to a polygon
                        const epsilon = 0.02 * cv.arcLength(receiptContour, true);
                        const approx = new cv.Mat();
                        cv.approxPolyDP(receiptContour, approx, epsilon, true);

                        // If we have exactly 4 points, we found our receipt
                        if (approx.rows === 4) {
                            // Sort points to get top-left, top-right, bottom-right, bottom-left
                            const points = sortPoints(approx);
                            
                            // Calculate width and height of the receipt
                            const width = Math.max(
                                distance(points.topRight, points.topLeft),
                                distance(points.bottomRight, points.bottomLeft)
                            );
                            const height = Math.max(
                                distance(points.bottomLeft, points.topLeft),
                                distance(points.bottomRight, points.topRight)
                            );

                            // Define destination points for perspective transform
                            const dstPoints = new cv.Mat(4, 1, cv.CV_32FC2);
                            dstPoints.data32F[0] = 0;
                            dstPoints.data32F[1] = 0;
                            dstPoints.data32F[2] = width;
                            dstPoints.data32F[3] = 0;
                            dstPoints.data32F[4] = width;
                            dstPoints.data32F[5] = height;
                            dstPoints.data32F[6] = 0;
                            dstPoints.data32F[7] = height;

                            // Define source points
                            const srcPoints = new cv.Mat(4, 1, cv.CV_32FC2);
                            srcPoints.data32F[0] = points.topLeft.x;
                            srcPoints.data32F[1] = points.topLeft.y;
                            srcPoints.data32F[2] = points.topRight.x;
                            srcPoints.data32F[3] = points.topRight.y;
                            srcPoints.data32F[4] = points.bottomRight.x;
                            srcPoints.data32F[5] = points.bottomRight.y;
                            srcPoints.data32F[6] = points.bottomLeft.x;
                            srcPoints.data32F[7] = points.bottomLeft.y;

                            // Calculate perspective transform matrix
                            const matrix = cv.getPerspectiveTransform(srcPoints, dstPoints);

                            // Apply perspective transform
                            const dst = new cv.Mat();
                            cv.warpPerspective(src, dst, matrix, new cv.Size(width, height));

                            // Enhance image
                            const enhanced = new cv.Mat();
                            cv.convertScaleAbs(dst, enhanced, 1.2, 10);

                            // Convert back to canvas
                            cv.imshow(canvas, enhanced);
                            const correctedImageData = canvas.toDataURL('image/jpeg', 0.8);

                            // Cleanup
                            src.delete();
                            gray.delete();
                            blurred.delete();
                            edges.delete();
                            contours.delete();
                            hierarchy.delete();
                            approx.delete();
                            dstPoints.delete();
                            srcPoints.delete();
                            matrix.delete();
                            dst.delete();
                            enhanced.delete();

                            resolve(correctedImageData);
                            return;
                        }
                    }

                    // If we couldn't find a proper receipt contour, return the original image
                    resolve(imageData);
                } catch (error) {
                    console.error('Error processing image:', error);
                    resolve(imageData); // Fallback to original image
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = imageData;
        });
    } catch (error) {
        console.error('Error in correctPerspective:', error);
        return imageData; // Fallback to original image
    }
};

const sortPoints = (approx: any): Quadrilateral => {
    const points: Point[] = [];
    for (let i = 0; i < 4; i++) {
        points.push({
            x: approx.data32S[i * 2],
            y: approx.data32S[i * 2 + 1]
        });
    }

    // Sort points by y-coordinate
    points.sort((a, b) => a.y - b.y);

    // Get top and bottom points
    const topPoints = points.slice(0, 2);
    const bottomPoints = points.slice(2);

    // Sort top points by x-coordinate
    topPoints.sort((a, b) => a.x - b.x);
    // Sort bottom points by x-coordinate
    bottomPoints.sort((a, b) => a.x - b.x);

    return {
        topLeft: topPoints[0],
        topRight: topPoints[1],
        bottomRight: bottomPoints[1],
        bottomLeft: bottomPoints[0]
    };
};

const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}; 