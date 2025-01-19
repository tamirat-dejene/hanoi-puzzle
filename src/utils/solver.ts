function towerOfHanoiSolver(
  n: number,
  lftTower: number,
  midTower: number,
  rgtTower: number,
  result: [number, number][] = []
): [number, number][] {
  if (n === 1) {
    // console.log(`Move disk 1 from ${lftTower} to ${rgtTower}`);
    result.push([lftTower, rgtTower]); // Record the move
    return result;
  }

  // Step 1: Move n-1 disks from source to auxiliary
  towerOfHanoiSolver(n - 1, lftTower, rgtTower, midTower, result);

  // Step 2: Move the nth disk from source to destination
//   console.log(`Move disk ${n} from ${lftTower} to ${rgtTower}`);
  result.push([lftTower, rgtTower]); // Record the move

  // Step 3: Move n-1 disks from auxiliary to destination
  towerOfHanoiSolver(n - 1, midTower, lftTower, rgtTower, result);

  return result;
}

export { towerOfHanoiSolver };
