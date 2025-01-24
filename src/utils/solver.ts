function towersOfHanoiSolver(
  n: number,
  lftTower: number,
  midTower: number,
  rgtTower: number,
  result: [number, number][] = []
): [number, number][] {
  if (n === 1) {
    result.push([lftTower, rgtTower]); // Record the move
    return result;
  }

  // Step 1: Move n-1 disks from left to middle
  towersOfHanoiSolver(n - 1, lftTower, rgtTower, midTower, result);

  // Step 2: Move the nth disk from left to right
  result.push([lftTower, rgtTower]); // Record the move

  // Step 3: Move n-1 disks from middle to right
  towersOfHanoiSolver(n - 1, midTower, lftTower, rgtTower, result);

  return result;
}

export { towersOfHanoiSolver };
