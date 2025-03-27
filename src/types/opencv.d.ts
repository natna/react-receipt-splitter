declare module 'opencv.js' {
    export interface Size {
        width: number;
        height: number;
    }

    export interface Mat {
        rows: number;
        cols: number;
        data32F: Float32Array;
        data32S: Int32Array;
        delete(): void;
    }

    export interface MatVector {
        size(): number;
        get(index: number): Mat;
        delete(): void;
    }

    export interface Point {
        x: number;
        y: number;
    }

    export const COLOR_RGBA2GRAY: number;
    export const RETR_EXTERNAL: number;
    export const CHAIN_APPROX_SIMPLE: number;

    export function imread(canvas: HTMLCanvasElement): Mat;
    export function imshow(canvas: HTMLCanvasElement, mat: Mat): void;
    export function cvtColor(src: Mat, dst: Mat, code: number): void;
    export function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number): void;
    export function Canny(src: Mat, dst: Mat, threshold1: number, threshold2: number): void;
    export function findContours(src: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number): void;
    export function contourArea(contour: Mat): number;
    export function arcLength(curve: Mat, closed: boolean): number;
    export function approxPolyDP(curve: Mat, approxCurve: Mat, epsilon: number, closed: boolean): void;
    export function getPerspectiveTransform(src: Mat, dst: Mat): Mat;
    export function warpPerspective(src: Mat, dst: Mat, matrix: Mat, dsize: Size): void;
    export function convertScaleAbs(src: Mat, dst: Mat, alpha: number, beta: number): void;
} 