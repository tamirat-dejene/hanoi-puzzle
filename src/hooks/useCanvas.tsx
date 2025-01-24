import { useEffect, useRef, useState } from "react";
import { clear_canvas } from "../utils/canvas_utils";
import { draw_disk, draw_hanoi_towers } from "../utils/components";
import { BOTTOM_OFFSET, CANVAS_HEIGHT, DISK_SPACING, TOWER_SPACING } from "../utils/constants";
import { getMousePos, isMouseInDisk } from "../utils/events";
import { init_disks } from "../utils/intializers";
import { towerOfHanoiSolver } from "../utils/solver";
import { Disk, MoveLog } from "../utils/types";

const useCanvas = (diskCount: number) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [leftDisks, setLeftDisks] = useState<Disk[]>(init_disks(diskCount, 0));
    const [midDisks, setMidDisks] = useState<Disk[]>([]);
    const [rightDisks, setRightDisks] = useState<Disk[]>([]);
    const [moves, setMoves] = useState<number>(0);
    const [movesLog, setMovesLog] = useState<MoveLog[]>([]);
    const [solved, setSolved] = useState<boolean>(false);
    const [solving, setSolving] = useState<boolean>(false);
    const [draggingDisk, setDraggingDisk] = useState<(Disk & { towerIndex: number, old_x: number, old_y: number }) | null>(null);

    const stepIndexRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Restart handler
    const handleRestart = () => {
        // Clear any active timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setLeftDisks(init_disks(diskCount, 0));
        setMidDisks([]);
        setRightDisks([]);
        setMoves(0);
        setMovesLog([]);
        setSolved(false);
        setDraggingDisk(null);
        setSolving(false);

        stepIndexRef.current = 0;
    };

    // Reset towers when diskCount changes
    useEffect(() => {
        setLeftDisks(init_disks(diskCount, 0));
        setMidDisks([]);
        setRightDisks([]);
    }, [diskCount]);

    // hide the success message after 5 seconds
    useEffect(() => {
        if (solved) {
            setTimeout(() => {
                setSolved(false);
                setSolving(false);
            }, 5000);
        }
    }, [solved]);

    // Draw the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        clear_canvas(ctx, 0, 0, canvas.width, canvas.height);
        draw_hanoi_towers(canvas, ctx);
        [leftDisks, midDisks, rightDisks].forEach((towerDisks) => towerDisks.forEach((disk) => draw_disk(ctx, disk)));
        if (rightDisks.length === diskCount) setSolved(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leftDisks, midDisks, rightDisks]);

    // Handle interactions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const validateMove = (disk: Disk, targetTowerIndex: number) => {
            const towers = [leftDisks, midDisks, rightDisks];
            return (
                targetTowerIndex >= 0 &&
                targetTowerIndex <= 2 &&
                (towers[targetTowerIndex].length === 0 ||
                    disk.width < towers[targetTowerIndex][towers[targetTowerIndex].length - 1].width)
            );
        };

        const handleMouseDown = (e: MouseEvent) => {
            const { x, y } = getMousePos(canvas, e);
            const towers = [leftDisks, midDisks, rightDisks];
            const towerIndex = Math.floor(x / TOWER_SPACING);
            const tower = towers[towerIndex];
            if (!tower || tower.length === 0) return;

            const topDisk = tower[tower.length - 1];
            if (isMouseInDisk(x, y, topDisk)) setDraggingDisk({ ...topDisk, towerIndex, old_x: topDisk.top_left.x, old_y: topDisk.top_left.y });
        };

        const handleMouseMove = (e: MouseEvent) => {
            const { x, y } = getMousePos(canvas, e);
            const towerIndex = Math.floor(x / TOWER_SPACING);
            const towers = [leftDisks, midDisks, rightDisks];
            const topDisk = towers[towerIndex].length > 0 ? towers[towerIndex][towers[towerIndex].length - 1] : null;
            if (topDisk && isMouseInDisk(x, y, topDisk)) canvas.style.cursor = "pointer";
            else canvas.style.cursor = "default";
            if (!draggingDisk) return;
            canvas.style.cursor = "grabbing";
            const updatedDisk = {
                ...draggingDisk, top_left: {
                    x: x - draggingDisk.width / 2,
                    y: y - draggingDisk.height / 2
                }
            };
            switch (draggingDisk.towerIndex) {
                case 0: setLeftDisks((prev) => [...prev.slice(0, -1), updatedDisk]); break;
                case 1: setMidDisks((prev) => [...prev.slice(0, -1), updatedDisk]); break;
                case 2: setRightDisks((prev) => [...prev.slice(0, -1), updatedDisk]); break;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!draggingDisk) return;
            const { x } = getMousePos(canvas, e);
            const targetTowerIndex = Math.floor(x / TOWER_SPACING);

            const towers = [leftDisks, midDisks, rightDisks];
            const setTowers = [setLeftDisks, setMidDisks, setRightDisks];
            const tragetTowerDisks = towers[targetTowerIndex];

            if (
                validateMove(draggingDisk, targetTowerIndex) &&
                draggingDisk.towerIndex !== targetTowerIndex
            ) {
                draggingDisk.top_left = {
                    x: draggingDisk.old_x + (targetTowerIndex - draggingDisk.towerIndex) * TOWER_SPACING,
                    y: CANVAS_HEIGHT - BOTTOM_OFFSET - (tragetTowerDisks.length * DISK_SPACING) - (tragetTowerDisks.length + 1) * draggingDisk.height
                };
                setTowers[targetTowerIndex]((prev) => [...prev, draggingDisk]);
                setTowers[draggingDisk.towerIndex]((prev) => prev.slice(0, -1)); // remove the disk from the old tower
                setMoves((prev) => prev + 1);
                setMovesLog((prev) => [...prev, { disk: draggingDisk, from: draggingDisk.towerIndex, to: targetTowerIndex }]);
            } else {
                setTowers[draggingDisk.towerIndex]((prev) => prev.slice(0, -1)); // remove the invalid move
                setTowers[draggingDisk.towerIndex]((prev) => [...prev, {
                    ...draggingDisk, top_left: {
                        x: draggingDisk.old_x,
                        y: draggingDisk.old_y
                    }
                }]);
            }
            setDraggingDisk(null);
        };

        const handleMouseOut = () => {
            if (draggingDisk) {
                const setTowers = [setLeftDisks, setMidDisks, setRightDisks];
                setTowers[draggingDisk.towerIndex]((prev) => prev.slice(0, -1)); // remove the invalid move
                setTowers[draggingDisk.towerIndex]((prev) => [...prev, {
                    ...draggingDisk, top_left: {
                        x: draggingDisk.old_x,
                        y: draggingDisk.old_y
                    }
                }]);
                setDraggingDisk(null);
            }
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mouseout", handleMouseOut);

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mouseout", handleMouseOut);
        };
    }, [draggingDisk, leftDisks, midDisks, rightDisks]);

    // Function to solve the puzzle
    const handleSolve = () => {
        const solution = towerOfHanoiSolver(diskCount, 0, 1, 2); // [from, to]
        handleRestart();
        setSolving(true);
        setMovesLog([]);
        const moveSteps = solution.map(([from, to]: [number, number]) => ({ from, to }));

        const animateStep = (stepIndex: number) => {
            if (stepIndex >= moveSteps.length) {
                setSolving(false);
                return;
            }

            const { from, to } = moveSteps[stepIndex];
            moveDisk(from, to);
            setMovesLog((prev) => [...prev, { disk: leftDisks[leftDisks.length - 1], from, to }]);
            setMoves((prev) => prev + 1);
            stepIndexRef.current = stepIndex + 1;
            timeoutRef.current = setTimeout(() => animateStep(stepIndexRef.current), 1000);
        };

        animateStep(0);
    };

    // Function to move the disk with animation
    const moveDisk = (from: number, to: number) => {
        const setTowers = [setLeftDisks, setMidDisks, setRightDisks];
        setTowers[from]((prevSourceTower) => {
            if (prevSourceTower.length === 0) return prevSourceTower; // No disk to move
            const disk = prevSourceTower[prevSourceTower.length - 1];
            setTowers[to]((prevTargetTower) => {
                const target_x = disk.top_left.x + (to - from) * TOWER_SPACING;
                const target_y = CANVAS_HEIGHT - BOTTOM_OFFSET - (prevTargetTower.length * DISK_SPACING) - (prevTargetTower.length + 1) * disk.height;
                const updatedDisk = { ...disk, top_left: { x: target_x, y: target_y } };
                return [...prevTargetTower, updatedDisk]; // Add disk to target tower
            });
            return prevSourceTower.slice(0, -1); // Remove disk from source tower
        });
    };

    return [canvasRef, moves, movesLog, solved, solving, handleSolve, handleRestart] as const;
};

export default useCanvas;